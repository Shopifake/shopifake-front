import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Search, Download, Filter, ArrowLeft } from "lucide-react";
import { mockAuditLog, mockSites } from "../../lib/mock-data";

export function AuditLog({ siteId, onBack }: { siteId: string; onBack?: () => void }) {
  const [search, setSearch] = useState("");

  const site = mockSites.find(s => s.id === siteId);
  const filteredLogs = mockAuditLog
    .filter(log => log.siteId === siteId)
    .filter(log =>
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to {site?.name || 'Site Management'}
        </Button>
      )}
      <div>
        <h1>Audit Log - {site?.name}</h1>
        <p className="text-muted-foreground">Track all user actions and system changes for this site</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search audit logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.user}</TableCell>
                    <TableCell className="text-[#3B82F6]">{log.action}</TableCell>
                    <TableCell className="text-muted-foreground">{log.details}</TableCell>
                    <TableCell className="text-muted-foreground">{log.timestamp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {mockAuditLog.length} records
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
