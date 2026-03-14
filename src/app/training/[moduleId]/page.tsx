import { TrainingModulePage } from "@/components/training/training-module-page"

export default async function TrainingModuleRoute({
  params,
}: {
  params: Promise<{ moduleId: string }>
}) {
  const { moduleId } = await params
  return <TrainingModulePage moduleId={moduleId} />
}
