import RoleTransferControl from "./RoleTransferControl";

/* Header used to read "Distributor Controls" here - a copy-paste from
   DistributorControl.tsx. Renamed to match the component. */
const MasterDistributorControl = () => (
  <RoleTransferControl
    title="Master Distributor Controls"
    subtitle="Who master distributors may transfer to, and what each amount slab is charged."
  />
);

export default MasterDistributorControl;
