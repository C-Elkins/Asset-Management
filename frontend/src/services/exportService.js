export const exportService = {
  // Export assets to CSV
  exportToCSV: (assets, filename = 'assets-export') => {
    const headers = [
      'Asset Tag',
      'Name',
      'Brand',
      'Model',
      'Serial Number',
      'Status',
      'Condition',
      'Category',
      'Purchase Price',
      'Purchase Date',
      'Warranty Expiry',
      'Location',
      'Assigned Users',
      'Notes'
    ];

    const csvData = assets.map(asset => [
      asset.assetTag,
      asset.name,
      asset.brand || '',
      asset.model || '',
      asset.serialNumber || '',
      asset.status,
      asset.condition,
      asset.category?.name || '',
      asset.purchasePrice || '',
      asset.purchaseDate || '',
      asset.warrantyExpiry || '',
      asset.location || '',
      asset.assignedUsers?.map(u => `${u.firstName} ${u.lastName}`).join('; ') || '',
      asset.notes || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Export assets to PDF (simplified)
  exportToPDF: (assets, _filename = 'assets-export') => {
    const printWindow = window.open('', '_blank');
    const htmlContent = generatePDFHTML(assets);
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Auto-trigger print dialog
    setTimeout(() => {
      printWindow.print();
    }, 250);
  },

  // Export maintenance alerts
  exportAlertsToCSV: (alerts, filename = 'maintenance-alerts') => {
    const headers = [
      'Alert Type',
      'Severity',
      'Asset Name',
      'Asset Tag',
      'Title',
      'Message',
      'Date',
      'Recommended Action'
    ];

    const csvData = alerts.map(alert => [
      alert.type,
      alert.severity,
      alert.asset.name,
      alert.asset.assetTag,
      alert.title,
      alert.message,
      alert.date.toLocaleDateString(),
      alert.action
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const generatePDFHTML = (assets) => {
  const currentDate = new Date().toLocaleDateString();
  const totalValue = assets.reduce((sum, asset) => sum + (asset.purchasePrice || 0), 0);
  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Asset Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .summary { display: flex; justify-content: space-around; margin-bottom: 30px; background: #f5f5f5; padding: 20px; }
        .summary-item { text-align: center; }
        .summary-value { font-size: 24px; font-weight: bold; color: #333; }
        .summary-label { color: #666; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .status.available { background: #d4edda; color: #155724; }
        .status.assigned { background: #cce5ff; color: #004085; }
        .status.maintenance { background: #fff3cd; color: #856404; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
  <h1>Asset Management by Krubles — Report</h1>
        <p>Generated on ${currentDate}</p>
      </div>
      
      <div class="summary">
        <div class="summary-item">
          <div class="summary-value">${assets.length}</div>
          <div class="summary-label">Total Assets</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${assets.filter(a => a.status === 'AVAILABLE').length}</div>
          <div class="summary-label">Available</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${assets.filter(a => a.status === 'ASSIGNED').length}</div>
          <div class="summary-label">Assigned</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${formatCurrency(totalValue)}</div>
          <div class="summary-label">Total Value</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Asset Tag</th>
            <th>Name</th>
            <th>Brand/Model</th>
            <th>Status</th>
            <th>Condition</th>
            <th>Value</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          ${assets.map(asset => `
            <tr>
              <td>${asset.assetTag}</td>
              <td>${asset.name}</td>
              <td>${asset.brand || ''} ${asset.model || ''}</td>
              <td><span class="status ${asset.status.toLowerCase()}">${asset.status.replace('_', ' ')}</span></td>
              <td>${asset.condition}</td>
              <td>${asset.purchasePrice ? formatCurrency(asset.purchasePrice) : 'N/A'}</td>
              <td>${asset.location || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
  <p>Asset Management by Krubles — Report generated automatically</p>
      </div>
    </body>
    </html>
  `;
};
