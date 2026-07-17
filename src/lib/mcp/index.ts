import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listToolkits from "./tools/list-toolkits";
import getToolkit from "./tools/get-toolkit";
import listProjects from "./tools/list-projects";
import whoami from "./tools/whoami";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "pdf-empire-mcp",
  title: "PDF Empire AI",
  version: "0.1.0",
  instructions:
    "Tools for PDF Empire AI. Use `whoami` to verify auth, `list_toolkits` and `get_toolkit` to browse the signed-in user's generated PDF toolkits, and `list_launch_projects` to browse their launch projects.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoami, listToolkits, getToolkit, listProjects],
});
