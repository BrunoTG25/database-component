import * as pulumi from "@pulumi/pulumi";
import * as azure_native from "@pulumi/azure-native";

// Load configuration
const config = new pulumi.Config();
const location = config.get("location") || "East US";
const adminLogin = config.require("sqlAdmin");
const adminPassword = config.requireSecret("sqlPassword");
const clientIp = config.get("clientIp") || "0.0.0.0"; // Update with your IP

// 1. Resource Group
const resourceGroup = new azure_native.resources.ResourceGroup("rg-sql-demo", {
    location,
});

// 2. SQL Server
const sqlServer = new azure_native.sql.Server("sqlserver-demo", {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    administratorLogin: adminLogin,
    administratorLoginPassword: adminPassword,
    version: "12.0", // SQL version
});

// 3. SQL Database
const sqlDatabase = new azure_native.sql.Database("sqldb-demo", {
    resourceGroupName: resourceGroup.name,
    serverName: sqlServer.name,
    location: resourceGroup.location,
    sku: {
        name: "S0",         // SKU name (Standard S0)
        tier: "Standard",   // Service tier
    },
    maxSizeBytes: 2147483648, // 2 GB
});

// 4. Firewall Rule (optional but recommended)
const firewallRule = new azure_native.sql.FirewallRule("allow-client-ip", {
    resourceGroupName: resourceGroup.name,
    serverName: sqlServer.name,
    startIpAddress: clientIp,
    endIpAddress: clientIp,
});


// Output connection info
export const resourceGroupName = resourceGroup.name;
export const sqlServerName = sqlServer.name;
export const sqlDatabaseName = sqlDatabase.name;
export const sqlFullyQualifiedDomainName = sqlServer.fullyQualifiedDomainName;