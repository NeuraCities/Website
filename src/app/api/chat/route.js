import { NextResponse } from "next/server";
import { Client } from "@gradio/client";

const SPACE_NAME = "neuracities-ai/YVR_GIS_DEMO";

// Function to extract tables from markdown text using regex
function extractTablesFromMarkdown(text) {
  if (!text) return null;
  
  try {
    // Pattern to match markdown tables - matches the entire table including headers
    const tablePattern = /(\|[^\n]+\|(?:\r?\n\|(?:[-:]+\|)+)?(?:\r?\n\|[^\n]+\|)+)/g;
    const tables = text.match(tablePattern);
    
    if (!tables || tables.length === 0) return null;
    
    // Convert all found tables to HTML
    const htmlTables = [];
    const markdownTables = [];
    
    tables.forEach(markdownTable => {
      let htmlTable = '<div class="extracted-markdown-table">';
      htmlTable += '<table class="w-full border-collapse">';
      
      // Split the table into rows
      const rows = markdownTable.split('\n').filter(row => row.trim() !== '');
      
      let hasHeader = false;
      let hasProcessedHeader = false;
      
      rows.forEach((row, rowIndex) => {
        // Skip the separator row (contains only |----|----| format)
        if (row.match(/^\|(\s*[-:]+\s*\|)+$/)) {
          hasHeader = true;
          return;
        }
        
        const cells = row
          .split('|')
          .filter((cell, idx, arr) => idx > 0 && idx < arr.length) // Remove empty cells from start/end
          .map(cell => cell.trim());
        
        if ((rowIndex === 0 || hasHeader) && !hasProcessedHeader) {
          // This is a header row
          htmlTable += '<thead><tr>';
          cells.forEach(cell => {
            htmlTable += `<th class="p-2 border-b-2 border-gray-300 bg-gray-100 text-left">${cell}</th>`;
          });
          htmlTable += '</tr></thead><tbody>';
          hasProcessedHeader = true;
          hasHeader = false;
        } else {
          // This is a data row
          htmlTable += '<tr class="hover:bg-gray-50">';
          cells.forEach(cell => {
            htmlTable += `<td class="p-2 border-b border-gray-200">${cell}</td>`;
          });
          htmlTable += '</tr>';
        }
      });
      
      htmlTable += '</tbody></table></div>';
      
      htmlTables.push(htmlTable);
      markdownTables.push(markdownTable);
    });
    
    return {
      htmlTables,
      markdownTables
    };
  } catch (err) {
    console.error("Error extracting tables:", err);
    return null;
  }
}

// Function to clean the response message by removing the tables and adding a reference note
function cleanResponseWithTableReferences(text, tableData) {
  if (!text || !tableData || !tableData.markdownTables || tableData.markdownTables.length === 0) return text;
  
  try {
    let cleanedText = text;

    // Replace each table in the text
    tableData.markdownTables.forEach(markdownTable => {
      // Safely escape regex special characters in the table text
      
      // Remove the table from the text
      cleanedText = cleanedText.replace(markdownTable, '');
    });
    
    // Look for notes after the tables
    const noteMatch = cleanedText.match(/^\s*(Note:.+?)(?=\n\n|$)/s);
    let note = '';
    if (noteMatch && noteMatch[1]) {
      note = noteMatch[1].trim();
      cleanedText = cleanedText.replace(noteMatch[0], '');
    }
    
    // Cleanup any multiple blank lines that might have been created
    cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n').trim();
    
    // Add a note about the table being available in the visualization panel
    let tableReference = `_**${tableData.htmlTables.length > 1 ? `${tableData.htmlTables.length} tables are` : 'Table data is'} available in the visualization panel**_`;
    
    if (note) {
      tableReference += `\n\n_${note}_`;
    }
    
    if (cleanedText.length === 0) {
      // If the message was just tables, provide a basic context
      return `I've prepared the requested data. ${tableReference}`;
    }
    
    // Check if the cleaned text already ends with a period or other punctuation
    const endsWithPunctuation = /[.!?]\s*$/.test(cleanedText);
    
    if (endsWithPunctuation) {
      return `${cleanedText}\n\n${tableReference}`;
    } else {
      return `${cleanedText}. \n\n${tableReference}`;
    }
  } catch (err) {
    console.error("Error cleaning response:", err);
    return text; // Return original text if there's an error
  }
}

// Converts dataframe format to HTML table
function dataframeToHtmlTable(dataframe) {
  if (!dataframe || !dataframe.data || !dataframe.headers) {
    return null;
  }
  
  try {
    // Create HTML table
    let htmlTable = '<div class="extracted-dataframe-table">';
    htmlTable += '<table class="w-full border-collapse">';
    
    // Add headers
    htmlTable += '<thead><tr>';
    dataframe.headers.forEach(header => {
      htmlTable += `<th class="p-2 border-b-2 border-gray-300 bg-gray-100 text-left">${header}</th>`;
    });
    htmlTable += '</tr></thead><tbody>';
    
    // Add data rows
    dataframe.data.forEach(row => {
      htmlTable += '<tr class="hover:bg-gray-50">';
      row.forEach(cell => {
        htmlTable += `<td class="p-2 border-b border-gray-200">${cell}</td>`;
      });
      htmlTable += '</tr>';
    });
    
    htmlTable += '</tbody></table></div>';
    
    return htmlTable;
  } catch (err) {
    console.error("Error converting dataframe to HTML table:", err);
    return null;
  }
}

export async function POST(req) {
  try {
    const { message, history } = await req.json();

    // Connect to the Gradio client
    const client = await Client.connect(SPACE_NAME);

    // Process the message with the new API endpoint
    const result = await client.predict("/process_query", {
      query: message,
    });

    console.log("API Response received with data length:", result.data?.length);

    // Prepare the response data
    const responseData = {
      history: [],
      map: "",
      tables: []
    };

    // Extract components from the result
    if (result.data && result.data.length >= 3) {
      // Extract text response
      const textResponse = result.data[0];
      
      // Extract dataframe (the table)
      const dataframe = result.data[1];
      
      // Extract map HTML
      const mapHtml = result.data[2];
      
      // Update chat history
      const updatedHistory = [...history, { role: "user", content: message }];
      if (textResponse) {
        updatedHistory.push({ role: "assistant", content: textResponse });
      }
      responseData.history = updatedHistory;
      
      // Set map content
      responseData.map = mapHtml || "";
      
      // Process dataframe into HTML table if it exists
      if (dataframe) {
        const htmlTable = dataframeToHtmlTable(dataframe);
        if (htmlTable) {
          responseData.tables = [htmlTable];
          responseData.hasTables = true;
          responseData.tableCount = 1;
        }
      }
      
      // Check for tables in the text response as fallback
      if (!responseData.hasTables && textResponse) {
        const extractedTableData = extractTablesFromMarkdown(textResponse);
        if (extractedTableData && extractedTableData.htmlTables.length > 0) {
          responseData.tables = extractedTableData.htmlTables;
          responseData.hasTables = true;
          responseData.tableCount = extractedTableData.htmlTables.length;
          
          // Update the last message in the history to remove raw tables
          const lastIndex = responseData.history.length - 1;
          if (lastIndex >= 0 && responseData.history[lastIndex].role === "assistant") {
            const cleanedMessage = cleanResponseWithTableReferences(
              responseData.history[lastIndex].content,
              extractedTableData
            );
            
            responseData.history[lastIndex] = {
              ...responseData.history[lastIndex],
              content: cleanedMessage
            };
          }
        }
      }
    } else {
      throw new Error("Invalid API response format");
    }

    // Return the enhanced response
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("API Error:", error);

    // Provide a more detailed error response
    return NextResponse.json({ 
      error: "Failed to fetch chat response", 
      details: error.message || "Unknown error occurred"
    }, { 
      status: 500 
    });
  }
}