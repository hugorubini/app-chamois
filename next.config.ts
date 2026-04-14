import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Important :
  // cette IP locale doit correspondre à l’adresse actuelle du Mac
  // utilisée pour tester l’application sur iPhone en réseau local.
  // Si la carte ne s’affiche plus sur iPhone, vérifier d’abord cette IP.
  allowedDevOrigins: ["192.168.10.109"],
};

export default nextConfig;