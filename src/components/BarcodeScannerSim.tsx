/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { FoodItem } from "../types";
import { ScanBarcode, Camera, RefreshCw, Upload, Sparkles, CheckCircle, HelpCircle } from "lucide-react";

interface BarcodeScannerSimProps {
  onBarcodeDetected: (barcode: string) => void;
  foods: FoodItem[];
  onClose?: () => void;
}

export default function BarcodeScannerSim({ 
  onBarcodeDetected, 
  foods,
  onClose 
}: BarcodeScannerSimProps) {
  const [useCamera, setUseCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [manualCode, setManualCode] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Turn on/off camera simulation
  const toggleCamera = async () => {
    if (useCamera) {
      stopCamera();
    } else {
      setCameraError("");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setUseCamera(true);
      } catch (err: any) {
        console.error("Camera access failed", err);
        setCameraError("瀏覽器相機開啟失敗，可能是因為在 iframe 沙盒開發環境中權限受限。請直接使用下方的「自帶預設條碼模擬按鈕」進行完整功能測試。");
        setUseCamera(false);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setUseCamera(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onBarcodeDetected(manualCode.trim());
      setManualCode("");
      stopCamera();
    }
  };

  // Simulated AI parse barcode from image file
  const [uploading, setUploading] = useState<boolean>(false);
  const handleBarcodeImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        // Send to Gemini OCR to extract barcode!
        const response = await fetch("/api/gemini/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64String })
        });
        const data = await response.json();
        
        if (response.ok) {
          if (data.barcode) {
            onBarcodeDetected(data.barcode);
            stopCamera();
          } else {
            // Fallback guess: if AI found a match in DB
            alert("相片中未發現明顯條碼。將為您模擬嘗試全文比對其商品名稱：" + (data.name || ""));
            if (data.name) {
              const found = foods.find((f) => f.name.includes(data.name) || data.name.includes(f.name));
              if (found) {
                onBarcodeDetected(found.barcode);
                stopCamera();
              } else {
                alert("找不到符合「" + data.name + "」的食品，請先至後台管理新增此食品資訊。");
              }
            } else {
              alert("AI 無法在圖片中解析出任何食品名稱或條碼！");
            }
          }
        } else {
          alert("辨識失敗：" + (data.error || "伺服器發生異常。請確認您的 GEMINI_API_KEY 已正確設定！"));
        }
      } catch (err) {
        alert("掃描圖片時發生連線中斷。");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Filter foods that actually have barcodes to provide as preset testing trigger
  const barcodeFoods = foods.filter((f) => f.barcode);

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-2xl max-w-lg mx-auto overflow-hidden relative text-[#1F2937]">
      
      {/* Title */}
      <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3.5 mb-5">
        <h3 className="font-extrabold text-[#111827] flex items-center gap-2">
          <ScanBarcode className="w-5 h-5 text-[#10B981] animate-pulse" />
          智慧條碼辨識掃描器
        </h3>
        {onClose && (
          <button 
            onClick={() => { stopCamera(); onClose(); }}
            className="text-[#4B5563] hover:text-[#111827] transition-colors p-1"
          >
            關閉
          </button>
        )}
      </div>

      {/* Main scanning box */}
      <div className="relative aspect-[4/3] bg-neutral-950 rounded-2xl overflow-hidden shadow-inner flex flex-col items-center justify-center text-white mb-5 border border-neutral-800">
        
        {/* Glow grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:16px_16px] opacity-25" />

        {useCamera ? (
          <>
            <video 
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
            />
            {/* Glowing Laser Scan Line */}
            <div className="absolute left-0 right-0 h-0.5 bg-[#10B981] shadow-[0_0_12px_rgba(16,185,129,1)] animate-[bounce_3s_infinite]" />
            
            {/* Camera Overlay Frame */}
            <div className="absolute inset-10 border-2 border-dashed border-[#10B981]/50 rounded-lg pointer-events-none opacity-60 flex items-center justify-center">
              <span className="text-[10px] bg-black/85 px-2 py-0.5 text-[#E5E7EB] font-bold rounded border border-neutral-800">
                對準產品包裝條碼
              </span>
            </div>
          </>
        ) : (
          <div className="z-10 text-center px-6 space-y-3.5">
            <ScanBarcode className="w-14 h-14 text-neutral-500 mx-auto animate-pulse" />
            <div>
              <p className="text-xs font-bold text-white">目前相機處於關閉狀態</p>
              <p className="text-[10px] text-neutral-400 max-w-xs mt-1">
                您可以開啟實體相機掃鏡，或直接點選下方快捷食物條碼 1 秒模擬掃碼效果。
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={toggleCamera}
                className="px-3.5 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1.5 transition-all text-xs"
              >
                <Camera className="w-4 h-4" />
                開啟相機鏡頭
              </button>

              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  id="barcode-image"
                  onChange={handleBarcodeImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <label
                  htmlFor="barcode-image"
                  className="px-3.5 py-1.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1F2937] border border-[#E5E7EB] font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#10B981]" />
                      <span>辨識條碼中...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>上傳條碼相片</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        )}

        {cameraError && (
          <div className="absolute bottom-3 inset-x-3 p-2 bg-[#FFFBEB]/95 border border-amber-200 text-amber-800 rounded-xl leading-relaxed text-[10px] z-20">
            {cameraError}
          </div>
        )}
      </div>

      {/* Manual Input form */}
      <form onSubmit={handleManualSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="手動輸入商品條碼 (其一，如: 4710126521366)"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          className="flex-1 px-3.5 py-2.5 border border-[#E5E7EB] bg-[#F9FAFB] text-[#111827] placeholder-neutral-400 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#10B981]"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-[#10B981] border border-transparent text-white hover:bg-[#059669] font-bold text-xs rounded-xl cursor-pointer transition-all"
        >
          送出辨認
        </button>
      </form>

      {/* Quick Simulated presets */}
      <div className="bg-[#F9FAFB] rounded-2xl p-4 border border-[#E5E7EB]">
        <div className="flex items-center gap-1 text-[11px] font-bold text-[#1F2937] mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
          <span>免鏡頭 1秒極速快捷模擬掃描 (強力推薦點擊體驗)：</span>
        </div>

        {barcodeFoods.length === 0 ? (
          <p className="text-[10px] text-[#4B5563]">目前環境數據庫無商品，請在管理台添加條碼。</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {barcodeFoods.map((food) => (
              <button
                key={food.id}
                onClick={() => {
                  onBarcodeDetected(food.barcode);
                  stopCamera();
                }}
                className="p-2.5 bg-white border border-[#E5E7EB] rounded-xl hover:border-[#10B981]/50 text-left cursor-pointer transition-colors"
              >
                <div className="text-[10px] font-black text-[#4B5563] truncate uppercase tracking-widest">
                  [{food.brand || "未登標包"}]
                </div>
                <div className="text-[11px] font-bold text-[#111827] truncate mt-0.5">
                  {food.name}
                </div>
                <div className="text-[9px] font-mono text-[#4B5563] mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-[#10B981]" />
                  <span>條碼：{food.barcode}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3.5 border-t border-[#E5E7EB] flex items-center gap-1 text-[#4B5563] text-[10px] justify-center">
        <HelpCircle className="w-3.5 h-3.5 text-[#10B981]" />
        <span>提示：無論是真實鏡頭、上傳照片 OCR、或點按模擬鈕，凡成功配對均可直達食物專屬面板。</span>
      </div>

    </div>
  );
}
