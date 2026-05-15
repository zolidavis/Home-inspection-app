import { useLocalSearchParams } from "expo-router";
import { FormEditor } from "../../../../components/FormEditor";
import { WIND_MIT_SECTIONS } from "../../../../lib/form-meta";

export default function EditWindMit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <FormEditor
      inspectionId={id!}
      formKey="windMit"
      sections={WIND_MIT_SECTIONS}
      title="Wind Mitigation (OIR-B1-1802)"
    />
  );
}
