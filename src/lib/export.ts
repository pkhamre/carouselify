import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function exportAsPNG(element: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    width: 1080,
    height: 1080,
  });

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, "image/png");
  });
}

export async function exportAsPDF(elements: HTMLElement[]): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [1080, 1080],
  });

  for (let i = 0; i < elements.length; i++) {
    const canvas = await html2canvas(elements[i], {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      width: 1080,
      height: 1080,
    });

    const imgData = canvas.toDataURL("image/png");

    if (i > 0) {
      pdf.addPage([1080, 1080], "portrait");
    }

    pdf.addImage(imgData, "PNG", 0, 0, 1080, 1080);
  }

  return pdf.output("blob");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
