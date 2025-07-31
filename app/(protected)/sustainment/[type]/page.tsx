import { ClientSustainmentTypePage } from "./client-sustainment-type-page"



// TODO: Load sustainment data from a real source (API, context, etc.)

export function generateStaticParams() {
  return [
    { type: 'cpmr' },
    { type: 'iapr' },
    { type: 'tmtr' },
  ];
}



export default function SustainmentTypePage({ params }: { params: any }) {
  return <ClientSustainmentTypePage type={params.type} />;
}
