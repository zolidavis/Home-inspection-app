import { useLocalSearchParams } from "expo-router";
import { FormEditor } from "../../../../components/FormEditor";
import { FOUR_POINT_SECTIONS } from "../../../../lib/form-meta";

export default function EditFourPoint() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <FormEditor
      inspectionId={id!}
      formKey="fourPoint"
      sections={FOUR_POINT_SECTIONS}
      title="4-Point form"
    />
  );
}
