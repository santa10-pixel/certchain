const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("----------------------------------------------------");
  console.log("Deploying AcademicCertificateRegistry to network:", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH");

  const Registry = await hre.ethers.getContractFactory("AcademicCertificateRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  console.log("AcademicCertificateRegistry deployed at:", contractAddress);

  const artifact = await hre.artifacts.readArtifact("AcademicCertificateRegistry");

  const configData = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    address: contractAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    abi: artifact.abi,
  };

  // Export to backend config
  const backendConfigDir = path.resolve(__dirname, "../../backend/src/config");
  if (!fs.existsSync(backendConfigDir)) {
    fs.mkdirSync(backendConfigDir, { recursive: true });
  }
  const backendConfigFile = path.join(backendConfigDir, "contractConfig.json");
  fs.writeFileSync(backendConfigFile, JSON.stringify(configData, null, 2));
  console.log("Contract config written to backend:", backendConfigFile);

  // Also write to blockchain directory for reference
  const localConfigFile = path.resolve(__dirname, "../contractAddress.json");
  fs.writeFileSync(localConfigFile, JSON.stringify(configData, null, 2));
  console.log("Contract config written to blockchain:", localConfigFile);

  console.log("----------------------------------------------------");
  console.log("Deployment completed successfully!");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
