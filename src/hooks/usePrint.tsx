import { SetDateRange } from "@/lib/getDateRangeData";
import { formatDate } from "date-fns";
import { marked } from "marked";

const usePrint = () => {
  const printReport = ({
    aiResponse,
    reportRange,
  }: {
    aiResponse: string;
    reportRange: SetDateRange;
  }) => {
    if (!aiResponse) return;

    // Create a hidden iframe for printing
    const printIframe = document.createElement("iframe");
    printIframe.style.position = "absolute";
    printIframe.style.width = "0px";
    printIframe.style.height = "0px";
    printIframe.style.border = "0";
    printIframe.style.left = "-9999px";
    document.body.appendChild(printIframe);

    // Get the iframe's document and write the content
    const frameDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
    if (!frameDoc) {
      document.body.removeChild(printIframe);
      return;
    }

    // Add print-specific styling
    const printStyles = `
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        h1, h2, h3, h4, h5, h6 {
          color: #000;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
        pre, code {
          background-color: #f5f5f5;
          padding: 0.2em;
          border-radius: 3px;
          font-family: Consolas, Monaco, 'Andale Mono', monospace;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        @media print {
          @page {
            size: auto;
            margin: 15mm;
          }
          body {
            padding: 0;
          }
        }
      `;

    // Create a report title with date range
    const reportTitle = `Financial Assessment Report (${formatDate(reportRange.from, "MMMM d, yyyy")} - ${formatDate(reportRange.to, "MMMM d, yyyy")})`;

    // Write the complete HTML to the iframe
    frameDoc.open();
    frameDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${reportTitle}</title>
            <style>${printStyles}</style>
          </head>
          <body>
            <h1>${reportTitle}</h1>
            <div>${marked.parse(aiResponse)}</div>
          </body>
        </html>
      `);
    frameDoc.close();

    // Wait for resources to load before printing
    printIframe.onload = () => {
      try {
        // Print the iframe
        printIframe.contentWindow?.focus();
        printIframe.contentWindow?.print();

        // Remove the iframe after printing is done or canceled
        setTimeout(() => {
          document.body.removeChild(printIframe);
        }, 1000);
      } catch (error) {
        console.error("Printing failed:", error);
        document.body.removeChild(printIframe);
      }
    };
  };

  return printReport;
};

export default usePrint;
