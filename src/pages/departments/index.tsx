import DepartmentHub from "./DepartmentHub";
import { SalesProfileCard } from "@/components/copy/SalesProfileCard";

export const OpportunityIntelligence = () => <DepartmentHub id="opportunities" />;
export const ProductStudio = () => <DepartmentHub id="studio" />;
export const FunnelProfitStudio = () => <DepartmentHub id="funnels" />;
export const SalesCopyIntelligence = () => <DepartmentHub id="copy"><SalesProfileCard /></DepartmentHub>;
