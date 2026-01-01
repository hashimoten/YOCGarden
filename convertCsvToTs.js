const fs = require('fs');
const path = require('path');

const csvFilePath = path.join(__dirname, 'data_j.xls - Sheet1.csv');
const outputFilePath = path.join(__dirname, 'src', 'data', 'stockList.ts');

try {
    const csvData = fs.readFileSync(csvFilePath, 'utf8');
    const lines = csvData.split('\n');

    // Skip header and process lines
    const stocks = lines.slice(1)
        .filter(line => line.trim() !== '')
        .map(line => {
            const columns = line.split(',');
            // Code is at index 1, Name is at index 2
            if (columns.length >= 3) {
                return {
                    code: columns[1].trim(),
                    name: columns[2].trim()
                };
            }
            return null;
        })
        .filter(item => item !== null);

    const tsContent = `export interface StockOption {
    code: string;
    name: string;
}

export const STOCK_LIST: StockOption[] = ${JSON.stringify(stocks, null, 4)};
`;

    fs.writeFileSync(outputFilePath, tsContent);
    console.log(`Successfully converted ${stocks.length} stocks to ${outputFilePath}`);

} catch (error) {
    console.error('Error converting CSV:', error);
}
