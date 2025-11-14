import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Alert, AlertDescription } from "../ui/alert";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function ImportProducts() {
  const [step, setStep] = useState<"upload" | "mapping" | "complete">("upload");
  const [importResults, setImportResults] = useState({ success: 45, errors: 3 });

  const sampleData = [
    { csvColumn: "Product Name", mapping: "name", sample: "Wireless Headphones Pro" },
    { csvColumn: "Product SKU", mapping: "sku", sample: "WHP-001" },
    { csvColumn: "Price", mapping: "price", sample: "299.99" },
    { csvColumn: "Stock", mapping: "stock", sample: "45" },
    { csvColumn: "Category", mapping: "category", sample: "Electronics" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Import Products</h1>
        <p className="text-muted-foreground">Bulk import products from CSV file</p>
      </div>

      {step === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your CSV file should include columns for product name, SKU, price, stock quantity, and category.
              </AlertDescription>
            </Alert>

            <div className="border-2 border-dashed rounded-lg p-12 text-center">
              <FileSpreadsheet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="mb-2">Upload CSV File</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop your CSV file here or click to browse
              </p>
              <Button onClick={() => setStep("mapping")} className="bg-primary hover:bg-primary/90">
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
            </div>

            <div className="pt-4">
              <h4 className="mb-2">Need a template?</h4>
              <Button variant="outline" size="sm">
                Download Sample CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "mapping" && (
        <Card>
          <CardHeader>
            <CardTitle>Map CSV Columns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Map your CSV columns to product fields. We've automatically detected the best matches.
              </AlertDescription>
            </Alert>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CSV Column</TableHead>
                    <TableHead>Maps To</TableHead>
                    <TableHead>Sample Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.csvColumn}</TableCell>
                      <TableCell>
                        <Select defaultValue={row.mapping}>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name">Product Name</SelectItem>
                            <SelectItem value="sku">SKU</SelectItem>
                            <SelectItem value="price">Price</SelectItem>
                            <SelectItem value="stock">Stock</SelectItem>
                            <SelectItem value="category">Category</SelectItem>
                            <SelectItem value="ignore">Ignore</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{row.sample}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button onClick={() => setStep("complete")} className="bg-primary hover:bg-primary/90">
                Import Products
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "complete" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-[#22C55E]" />
              <CardTitle>Import Complete</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-[#22C55E]/10 border-[#22C55E]">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl text-[#22C55E] mb-1">{importResults.success}</p>
                    <p className="text-sm text-muted-foreground">Products Imported</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-destructive/10 border-destructive">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl text-destructive mb-1">{importResults.errors}</p>
                    <p className="text-sm text-muted-foreground">Errors</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {importResults.errors > 0 && (
                  <>Some products could not be imported due to validation errors. </>
                )}
                <a href="#" className="text-primary hover:underline">Download error report</a>
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Import More
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
                View Products
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
