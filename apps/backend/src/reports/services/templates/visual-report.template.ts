export const visualReportTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #333;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start; /* Alineación arriba */
      border-bottom: 2px solid #f3f4f6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo-section {
      display: flex;
      flex-direction: column;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #2563EB;
      margin-bottom: 5px;
    }
    .sub-logo {
      font-size: 12px;
      color: #9CA3AF;
    }

    /* Metadatos (Usuario, Fecha, Registros) */
    .meta {
      text-align: right;
      font-size: 12px;
      color: #4B5563;
      line-height: 1.6; /* Separación entre líneas */
    }
    .meta strong {
      color: #111827; /* Color más oscuro para las etiquetas */
    }

    /* Cards de Resumen */
    .summary {
      display: flex;
      gap: 20px;
      margin-bottom: 40px;
    }
    .card {
      flex: 1;
      padding: 20px;
      border-radius: 12px;
      color: white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .card-income { background: linear-gradient(135deg, #10B981 0%, #059669 100%); }
    .card-expense { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); }
    .card-balance { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); }
    
    .card-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9; margin-bottom: 5px; }
    .card-amount { font-size: 22px; font-weight: bold; }

    /* Tabla */
    h3 {
      font-size: 16px;
      color: #374151;
      margin-bottom: 15px;
      border-left: 4px solid #2563EB;
      padding-left: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th {
      text-align: left;
      padding: 12px;
      background-color: #F9FAFB;
      color: #6B7280;
      border-bottom: 1px solid #E5E7EB;
      text-transform: uppercase;
      font-size: 10px;
      font-weight: 600;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #E5E7EB;
      vertical-align: middle;
    }
    tr:last-child td { border-bottom: none; }

    /* Estilos de celdas */
    .badge {
      padding: 4px 8px;
      border-radius: 9999px; /* Pill shape */
      font-size: 10px;
      font-weight: bold;
      display: inline-block;
    }
    .badge-income { background-color: #D1FAE5; color: #065F46; }
    .badge-expense { background-color: #FEE2E2; color: #991B1B; }

    .amount { font-weight: bold; text-align: right; font-family: 'Courier New', Courier, monospace; }
    .text-green { color: #059669; }
    .text-red { color: #DC2626; }
    .date { color: #6B7280; width: 80px; }
    .category { font-weight: 500; }

    /* Footer */
    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 10px;
      color: #9CA3AF;
      border-top: 1px solid #E5E7EB;
      padding-top: 20px;
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="logo-section">
      <div class="logo">YourFinance</div>
      <div class="sub-logo">Reporte Financiero Oficial</div>
    </div>
    
    <div class="meta">
      <div><strong>Usuario:</strong> {{userId}}</div>
      <div><strong>Total Registros:</strong> {{totalTransactions}}</div>
      <div><strong>Fecha Generación:</strong> {{generatedDate}}</div>
      {{#if accountFilter}}
      <div style="margin-top: 5px; color: #2563EB;"><strong>Cuenta:</strong> {{accountFilter}}</div>
      {{/if}}
    </div>
  </div>

  <div class="summary">
    <div class="card card-income">
      <div class="card-title">Ingresos Totales</div>
      <div class="card-amount">{{totalIncome}}</div>
    </div>
    <div class="card card-expense">
      <div class="card-title">Gastos Totales</div>
      <div class="card-amount">{{totalExpense}}</div>
    </div>
    <div class="card card-balance">
      <div class="card-title">Balance Neto</div>
      <div class="card-amount">{{netBalance}}</div>
    </div>
  </div>

  <h3>Detalle de Movimientos</h3>
  <table>
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Tipo</th>
        <th>Categoría</th>
        <th>Descripción</th>
        <th>Cuenta</th>
        <th style="text-align: right;">Monto</th>
      </tr>
    </thead>
    <tbody>
      {{#each transactions}}
      <tr>
        <td class="date">{{date}}</td>
        <td>
           <span class="badge {{badgeClass}}">{{type}}</span>
        </td>
        <td class="category">{{category}}</td>
        <td>{{description}}</td>
        <td>{{account}}</td>
        <td class="amount {{colorClass}}">{{amount}} {{currency}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div class="footer">
    Documento generado automáticamente por YourFinance App. Validez informativa.
  </div>

</body>
</html>
`;
