import { ClientDeploymentTypePage } from "./client-deployment-type-page"



export function generateStaticParams() {
  return [
    { type: 'cpmr' },
    { type: 'iapr' },
    { type: 'tmtr' },
  ];
}



export default function DeploymentTypePage({ params }: { params: any }) {
  return <ClientDeploymentTypePage type={params.type} />;
}
