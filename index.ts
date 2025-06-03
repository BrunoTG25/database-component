import * as pulumi from "@pulumi/pulumi";
import * as azure_native from "@pulumi/azure-native";

// Configuración para entorno dev
const config = new pulumi.Config();
const environment = "dev";
const appName = "app";
const baseName = `${appName}-${environment}`;

const location = config.get("location") || "East US";
const adminLogin = config.require("sqlAdmin");
const adminPassword = config.requireSecret("sqlPassword");
const clientIp = config.get("clientIp") || "0.0.0.0"; // Reemplazar por tu IP pública

// 1. Resource Group
const resourceGroup = new azure_native.resources.ResourceGroup(`rg-${baseName}`, {
    location,
});

// 2. SQL Server
const sqlServer = new azure_native.sql.Server(`sqlsrv-${baseName}`, {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    administratorLogin: adminLogin,
    administratorLoginPassword: adminPassword,
    version: "12.0",
});

// 3. SQL Database (SKU para dev)
const sqlDatabase = new azure_native.sql.Database(`sqldb-${baseName}`, {
    resourceGroupName: resourceGroup.name,
    serverName: sqlServer.name,
    location: resourceGroup.location,
    sku: {
        name: "S0",
        tier: "Standard",
    },
    maxSizeBytes: 2147483648,
});

// 4. Firewall: permitir acceso desde tu IP
const firewallRule = new azure_native.sql.FirewallRule(`allow-${baseName}-ip`, {
    resourceGroupName: resourceGroup.name,
    serverName: sqlServer.name,
    startIpAddress: clientIp,
    endIpAddress: clientIp,
});

// Outputs útiles para conexión desde app o herramienta externa
export const sqlServerName = sqlServer.name;
export const sqlDatabaseName = sqlDatabase.name;
export const resourceGroupName = resourceGroup.name;
export const sqlFQDN = sqlServer.fullyQualifiedDomainName;
