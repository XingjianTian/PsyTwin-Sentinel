import { prisma } from "../lib/db";

async function checkDevices() {
  const devices = await prisma.device.findMany();
  console.log("总设备数:", devices.length);
  console.log("\nVR设备:", devices.filter(d => d.type === "VR").length);
  console.log("手环:", devices.filter(d => d.type === "BRACELET").length);
  console.log("脑电:", devices.filter(d => d.type === "EEG").length);
  
  console.log("\n所有设备列表:");
  devices.forEach(d => {
    console.log(`- ${d.name} (${d.type}) - ${d.status}`);
  });
}

checkDevices()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });