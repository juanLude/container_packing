// src/components/PDFPackingInstructions.tsx
import React, { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { PackingResult } from "../algorithms/types";

interface PDFPackingInstructionsProps {
  result: PackingResult | null;
}

const PDFPackingInstructions: React.FC<PDFPackingInstructionsProps> = ({
  result,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!result) return null;

  // Sort boxes by packing order (bottom to top, back to front)
  const getSortedBoxes = () => {
    return [...result.packedBoxes].sort((a, b) => {
      // Sort by Y (height), then Z (depth), then X (width)
      if (a.position.y !== b.position.y) return a.position.y - b.position.y;
      if (a.position.z !== b.position.z) return b.position.z - a.position.z;
      return a.position.x - b.position.x;
    });
  };

  // Generate PDF HTML content
  const generatePDFContent = () => {
    const sortedBoxes = getSortedBoxes();
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Loading Instructions - ${result.container.name}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            padding: 40px;
            max-width: 900px;
            margin: 0 auto;
            background: white;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 4px solid #2563eb;
          }
          
          .header h1 {
            color: #1e40af;
            font-size: 32px;
            margin-bottom: 8px;
            font-weight: 700;
          }
          
          .header .subtitle {
            color: #3b82f6;
            font-size: 18px;
            margin-bottom: 10px;
          }
          
          .header .date {
            color: #6b7280;
            font-size: 14px;
          }
          
          .summary {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 35px;
            border: 2px solid #d1d5db;
          }
          
          .summary h2 {
            color: #1e40af;
            font-size: 22px;
            margin-bottom: 20px;
            font-weight: 700;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
          }
          
          .summary-item {
            background: white;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #d1d5db;
          }
          
          .summary-item .label {
            font-weight: 600;
            color: #4b5563;
            font-size: 13px;
            margin-bottom: 4px;
          }
          
          .summary-item .value {
            color: #1f2937;
            font-size: 18px;
            font-weight: 700;
          }
          
          .stats-highlight {
            background: #dbeafe;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            border-left: 5px solid #3b82f6;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            text-align: center;
          }
          
          .stat-item .stat-label {
            font-size: 12px;
            color: #4b5563;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .stat-item .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #1e40af;
          }
          
          .instructions {
            margin-bottom: 30px;
          }
          
          .instructions h2 {
            color: #1e40af;
            font-size: 24px;
            margin-bottom: 25px;
            font-weight: 700;
          }
          
          .step {
            margin-bottom: 20px;
            padding: 20px;
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            page-break-inside: avoid;
            transition: all 0.2s;
          }
          
          .step:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          .step-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
          }
          
          .step-number {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            min-width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 18px;
            margin-right: 15px;
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
          }
          
          .step-title {
            font-size: 17px;
            font-weight: 700;
            color: #1f2937;
          }
          
          .step-content {
            margin-left: 55px;
          }
          
          .step-detail {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-top: 12px;
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }
          
          .step-detail-item {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
          }
          
          .step-detail-item .label {
            color: #6b7280;
            font-weight: 500;
          }
          
          .step-detail-item .value {
            font-weight: 700;
            color: #1f2937;
          }
          
          .position-info {
            margin-top: 15px;
            padding: 15px;
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            border-radius: 4px;
            font-size: 14px;
          }
          
          .position-info strong {
            color: #1e40af;
          }
          
          .position-coordinates {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-top: 10px;
          }
          
          .coordinate {
            background: white;
            padding: 8px;
            border-radius: 6px;
            text-align: center;
            border: 1px solid #bfdbfe;
          }
          
          .coordinate-label {
            font-size: 11px;
            color: #6b7280;
            text-transform: uppercase;
          }
          
          .coordinate-value {
            font-size: 16px;
            font-weight: 700;
            color: #1e40af;
          }
          
          .tips {
            background: #fef3c7;
            border-left: 5px solid #f59e0b;
            padding: 25px;
            border-radius: 8px;
            margin-top: 35px;
          }
          
          .tips h3 {
            color: #92400e;
            font-size: 20px;
            margin-bottom: 15px;
            font-weight: 700;
          }
          
          .tips ul {
            margin-left: 25px;
            color: #78350f;
          }
          
          .tips li {
            margin-bottom: 10px;
            line-height: 1.6;
          }
          
          .unpacked-section {
            background: #fee2e2;
            border-left: 5px solid #ef4444;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
          }
          
          .unpacked-section h3 {
            color: #991b1b;
            font-size: 18px;
            margin-bottom: 12px;
          }
          
          .unpacked-list {
            display: grid;
            gap: 8px;
          }
          
          .unpacked-item {
            background: white;
            padding: 10px;
            border-radius: 6px;
            font-size: 14px;
          }
          
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          
          @media print {
            body {
              padding: 20px;
            }
            
            .step {
              page-break-inside: avoid;
            }
            
            .step:hover {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📦 Container Loading Instructions</h1>
          <p class="subtitle">${result.container.name}</p>
          <p class="date">Generated: ${currentDate}</p>
        </div>
        
        <div class="summary">
          <h2>📋 Container Information</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="label">Dimensions (L × H × D)</div>
              <div class="value">${result.container.dimensions.x} × ${
      result.container.dimensions.y
    } × ${result.container.dimensions.z} cm</div>
            </div>
            <div class="summary-item">
              <div class="label">Weight Capacity</div>
              <div class="value">${result.container.maxWeight.toLocaleString()} kg</div>
            </div>
            <div class="summary-item">
              <div class="label">Total Volume</div>
              <div class="value">${(
                (result.container.dimensions.x *
                  result.container.dimensions.y *
                  result.container.dimensions.z) /
                1000000
              ).toFixed(2)} m³</div>
            </div>
            <div class="summary-item">
              <div class="label">Container ID</div>
              <div class="value">${result.container.id}</div>
            </div>
          </div>
        </div>
        
        <div class="stats-highlight">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">Packed Boxes</div>
              <div class="stat-value">${result.packedBoxes.length}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Volume Utilization</div>
              <div class="stat-value">${result.volumeUtilization.toFixed(
                1
              )}%</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Total Weight</div>
              <div class="stat-value">${result.totalWeight.toLocaleString()} kg</div>
            </div>
          </div>
        </div>
        
        <div class="instructions">
          <h2>📝 Step-by-Step Loading Instructions</h2>
          <p style="color: #6b7280; margin-bottom: 20px; font-size: 14px;">
            Follow these instructions in order to load the container optimally. 
            Boxes are sorted to maximize stability and space utilization.
          </p>
          
          ${sortedBoxes
            .map(
              (box, index) => `
            <div class="step">
              <div class="step-header">
                <div class="step-number">${index + 1}</div>
                <div class="step-title">
                  ${box.name || box.id}
                  ${
                    box.fragile
                      ? ' <span style="color: #ef4444;">⚠️ FRAGILE</span>'
                      : ""
                  }
                  ${
                    !box.stackable
                      ? ' <span style="color: #f59e0b;">⛔ DO NOT STACK</span>'
                      : ""
                  }
                </div>
              </div>
              <div class="step-content">
                <div class="step-detail">
                  <div class="step-detail-item">
                    <span class="label">Length (X):</span>
                    <span class="value">${box.dimensions.x} cm</span>
                  </div>
                  <div class="step-detail-item">
                    <span class="label">Height (Y):</span>
                    <span class="value">${box.dimensions.y} cm</span>
                  </div>
                  <div class="step-detail-item">
                    <span class="label">Depth (Z):</span>
                    <span class="value">${box.dimensions.z} cm</span>
                  </div>
                  <div class="step-detail-item">
                    <span class="label">Weight:</span>
                    <span class="value">${box.weight} kg</span>
                  </div>
                  <div class="step-detail-item">
                    <span class="label">Volume:</span>
                    <span class="value">${(
                      (box.dimensions.x * box.dimensions.y * box.dimensions.z) /
                      1000000
                    ).toFixed(3)} m³</span>
                  </div>
                  <div class="step-detail-item">
                    <span class="label">ID:</span>
                    <span class="value">${box.id}</span>
                  </div>
                </div>
                
                <div class="position-info">
                  <strong>📍 Position in Container:</strong>
                  <div class="position-coordinates">
                    <div class="coordinate">
                      <div class="coordinate-label">From Front</div>
                      <div class="coordinate-value">${box.position.x} cm</div>
                    </div>
                    <div class="coordinate">
                      <div class="coordinate-label">From Floor</div>
                      <div class="coordinate-value">${box.position.y} cm</div>
                    </div>
                    <div class="coordinate">
                      <div class="coordinate-label">From Left</div>
                      <div class="coordinate-value">${box.position.z} cm</div>
                    </div>
                  </div>
                  
                  <!-- Visual Diagram -->
                  <div style="margin-top: 15px; background: white; padding: 15px; border-radius: 8px; border: 2px solid #bfdbfe;">
                    <div style="text-align: center; margin-bottom: 10px; font-weight: 600; color: #1e40af; font-size: 13px;">
                      📐 Visual Guide - Box Placement
                    </div>
                    <svg viewBox="0 0 400 300" style="width: 100%; max-width: 400px; margin: 0 auto; display: block;">
                      <!-- Container outline -->
                      <rect x="50" y="50" width="300" height="200" fill="none" stroke="#94a3b8" stroke-width="3" stroke-dasharray="5,5"/>
                      <text x="200" y="40" text-anchor="middle" font-size="12" fill="#64748b" font-weight="bold">Container</text>
                      
                      <!-- Container dimensions labels -->
                      <text x="200" y="270" text-anchor="middle" font-size="11" fill="#64748b">${
                        result.container.dimensions.x
                      } cm (Length)</text>
                      <text x="30" y="150" text-anchor="middle" font-size="11" fill="#64748b" transform="rotate(-90 30 150)">${
                        result.container.dimensions.y
                      } cm (Height)</text>
                      
                      <!-- Origin point (0,0,0) -->
                      <circle cx="50" cy="250" r="4" fill="#ef4444"/>
                      <text x="50" y="265" text-anchor="middle" font-size="10" fill="#ef4444" font-weight="bold">Origin (0,0,0)</text>
                      
                      <!-- Box position -->
                      ${(() => {
                        const scaleX = 300 / result.container.dimensions.x;
                        const scaleY = 200 / result.container.dimensions.y;
                        const boxX = 50 + box.position.x * scaleX;
                        const boxY = 250 - box.position.y * scaleY;
                        const boxWidth = box.dimensions.x * scaleX;
                        const boxHeight = box.dimensions.y * scaleY;

                        return `
                          <!-- Box representation -->
                          <rect x="${boxX}" y="${
                          boxY - boxHeight
                        }" width="${boxWidth}" height="${boxHeight}" 
                                fill="#3b82f6" fill-opacity="0.3" stroke="#2563eb" stroke-width="2"/>
                          
                          <!-- Box label -->
                          <text x="${boxX + boxWidth / 2}" y="${
                          boxY - boxHeight / 2
                        }" 
                                text-anchor="middle" font-size="11" fill="#1e40af" font-weight="bold">This Box</text>
                          
                          <!-- Position marker -->
                          <circle cx="${boxX}" cy="${boxY}" r="5" fill="#22c55e"/>
                          <line x1="50" y1="250" x2="${boxX}" y2="${boxY}" stroke="#22c55e" stroke-width="2" stroke-dasharray="3,3"/>
                          
                          <!-- Dimension arrows and labels -->
                          <!-- X dimension -->
                          <line x1="50" y1="255" x2="${boxX}" y2="255" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrowhead)"/>
                          <text x="${
                            (50 + boxX) / 2
                          }" y="270" text-anchor="middle" font-size="10" fill="#f59e0b" font-weight="bold">X: ${
                          box.position.x
                        } cm</text>
                          
                          <!-- Y dimension -->
                          <line x1="45" y1="250" x2="45" y2="${boxY}" stroke="#8b5cf6" stroke-width="2" marker-end="url(#arrowhead)"/>
                          <text x="35" y="${
                            (250 + boxY) / 2
                          }" text-anchor="middle" font-size="10" fill="#8b5cf6" font-weight="bold" transform="rotate(-90 35 ${
                          (250 + boxY) / 2
                        })">Y: ${box.position.y} cm</text>
                        `;
                      })()}
                      
                      <!-- Arrow marker definition -->
                      <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                          <polygon points="0 0, 10 3, 0 6" fill="#22c55e"/>
                        </marker>
                      </defs>
                      
                      <!-- Axis labels -->
                      <text x="360" y="260" font-size="11" fill="#64748b" font-weight="bold">→ X (Front to Back)</text>
                      <text x="60" y="40" font-size="11" fill="#64748b" font-weight="bold">↑ Y (Floor to Top)</text>
                      
                      <!-- Legend -->
                      <g transform="translate(50, 10)">
                        <circle cx="0" cy="0" r="3" fill="#ef4444"/>
                        <text x="8" y="4" font-size="9" fill="#64748b">Origin</text>
                        
                        <circle cx="60" cy="0" r="3" fill="#22c55e"/>
                        <text x="68" y="4" font-size="9" fill="#64748b">Box Corner</text>
                      </g>
                    </svg>
                    
                    <div style="margin-top: 12px; padding: 10px; background: #f0f9ff; border-radius: 6px; font-size: 12px; color: #0c4a6e;">
                      <strong>How to place:</strong> Position the front-bottom-left corner of the box at the green dot (X=${
                        box.position.x
                      }, Y=${box.position.y}, Z=${box.position.z}).
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        
        ${
          result.unpackedBoxes.length > 0
            ? `
          <div class="unpacked-section">
            <h3>⚠️ Unpacked Boxes (${result.unpackedBoxes.length})</h3>
            <p style="margin-bottom: 15px; font-size: 14px;">The following boxes could not be packed in this container:</p>
            <div class="unpacked-list">
              ${result.unpackedBoxes
                .map(
                  (box) => `
                <div class="unpacked-item">
                  <strong>${box.name || box.id}</strong> - 
                  ${box.dimensions.x} × ${box.dimensions.y} × ${
                    box.dimensions.z
                  } cm, 
                  ${box.weight} kg
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }
        
        <div class="tips">
          <h3>⚠️ Important Recommendations</h3>
          <ul>
            <li><strong>Loading order:</strong> Strictly follow the indicated order to optimize space and maintain container stability.</li>
            <li><strong>Verification:</strong> After placing each box, verify it is properly secured before proceeding to the next one.</li>
            <li><strong>Coordinate system:</strong> Positions are measured from the front-bottom-left corner of the container (0,0,0).</li>
            <li><strong>Fragile boxes:</strong> Boxes marked as FRAGILE require special handling and cushioning materials.</li>
            <li><strong>Stacking restrictions:</strong> Respect "DO NOT STACK" indications to avoid damage.</li>
            <li><strong>Weight distribution:</strong> Total container weight is ${result.totalWeight.toLocaleString()} kg. Ensure even distribution.</li>
            <li><strong>Center of gravity:</strong> Calculated position: X=${result.centerOfGravity.x.toFixed(
              1
            )}cm, Y=${result.centerOfGravity.y.toFixed(
      1
    )}cm, Z=${result.centerOfGravity.z.toFixed(1)}cm</li>
            <li><strong>Stability:</strong> ${
              result.isStable
                ? "✅ The container is balanced and stable."
                : "⚠️ Review weight distribution to improve stability."
            }</li>
          </ul>
        </div>
        
        <div class="footer">
          <p><strong>Container Packing Optimizer</strong></p>
          <p>Automatically generated document - ${currentDate}</p>
          <p>Algorithm used: Heuristic Packing | Computation time: ${result.packingTime.toFixed(
            2
          )}ms</p>
          <p>© ${new Date().getFullYear()} - All rights reserved</p>
        </div>
      </body>
      </html>
    `;
  };

  // Generate and download PDF
  const handleDownloadPDF = () => {
    setIsGenerating(true);

    try {
      const htmlContent = generatePDFContent();

      // Open in new window for printing
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Wait for content to load before showing print dialog
        setTimeout(() => {
          printWindow.print();
          setIsGenerating(false);
        }, 500);
      } else {
        alert("Please allow pop-ups to download the loading instructions.");
        setIsGenerating(false);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      setIsGenerating(false);
      alert(
        "An error occurred while generating the instructions. Please try again."
      );
    }
  };

  return (
    <button
      onClick={handleDownloadPDF}
      disabled={isGenerating}
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4" />
          <span>Download Loading Instructions</span>
        </>
      )}
    </button>
  );
};

export default PDFPackingInstructions;
