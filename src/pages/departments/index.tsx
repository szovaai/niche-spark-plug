import DepartmentHub from "./DepartmentHub";
import { SalesProfileCard } from "@/components/copy/SalesProfileCard";
import { useActiveProject } from "@/hooks/useActiveProject";
import { ProductBuildEngine } from "@/components/nova/ProductBuildEngine";

export const OpportunityIntelligence = () => <DepartmentHub id="opportunities" />;
export const ProductStudio = () => {
  const { data: project, isLoading, error } = useActiveProject();
  return <DepartmentHub id="studio"><section className="space-y-4"><h2 className="text-xl font-semibold">{project?.project_name ?? "Business product workspace"}</h2>{isLoading ? <p className="text-sm text-muted-foreground">Loading your business…</p> : error ? <p role="alert" className="text-sm text-destructive">Couldn't load your business. Refresh to try again.</p> : project ? <ProductBuildEngine key={project.id} projectId={project.id} /> : <p className="text-sm text-muted-foreground">Create a business in Business HQ to save a product bundle.</p>}</section></DepartmentHub>;
};
export const FunnelProfitStudio = () => <DepartmentHub id="funnels" />;
export const SalesCopyIntelligence = () => <DepartmentHub id="copy"><SalesProfileCard /></DepartmentHub>;
