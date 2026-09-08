import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ServiceForm } from "@/components/teksum/service-form";
import { educationProviders } from "@/components/teksum/service-discovery";


export default async function Page({
  params,
}: {
  params: Promise<{ provider: string; product: string }>;
}) {
  const { provider, product } = await params;
  const item = educationProviders.find((entry) => entry.slug === provider);
  const productItem = item?.products.find(([slug]) => slug === product);
  const title = productItem?.[1];

  if (!item || !title) notFound();

  return (
    <div className="teksum-dashboard-page min-w-0 w-full flex flex-1 flex-col gap-6">
      <Link
        href={`/dashboard/exam-pins/${provider}`}
        className="inline-flex w-fit items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 size-4" />
        {item.name}
      </Link>
      <ServiceForm
        category="EDUCATION_PIN"
        title={`${item.name} ${title}`}
        description="This product is selected for this page. We will show the current price and availability before you confirm."
        initialNetwork={provider}
        fixedPlanId={productItem?.[2]}
        lockSelection
      />
    </div>
  );
}
