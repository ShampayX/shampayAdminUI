import RoleTransferControl from "./RoleTransferControl";

const AgentControl = () => (
  <RoleTransferControl
    title="Agent Controls"
    subtitle="Who agents may transfer to, and what each amount slab is charged."
    mirrorMinAmount
  />
);

export default AgentControl;
