import { useEffect, useState, useContext } from "react";
import { useAuthContext } from "src/auth/useAuthContext";
import PayoutComponet from "./PayoutComponet";
import { EmptyState, LoadingState } from "src/components/page-kit";
import AltRouteOutlinedIcon from "@mui/icons-material/AltRouteOutlined";
import { CategoryContext } from "./ServicesVenderSwitch";

// ----------------------------------------------------------------------
// Vendor Switch > Payout Payments.
//
// Loads the products under the Payout Payments category and renders one
// PayoutComponet per product. Same two endpoints as before:
//
//   GET product/get_ProductList/<categoryId>
//   GET product/payout_payment_vendor_list
//
// The routing write lives in PayoutComponet and is untouched.
// ----------------------------------------------------------------------

export default function PayoutPayments() {
  const { Api } = useAuthContext();
  const CategoryContaxt: any = useContext(CategoryContext);
  const [isLoading, setIsLoading] = useState(false);
  const [productId, setProductId] = useState<any>([]);
  const [vendorList, setVendorList] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  useEffect(() => {
    getProductlist(CategoryContaxt?._id);
  }, [refreshTrigger]);

  const getProductlist = (val: string) => {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    Api(`product/get_ProductList/${val}`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status === 200 && Response.data.code === 200) {
          setProductId(Response.data.data); // full product list
          MTVendors(); // vendor list
        } else {
          setIsLoading(false);
        }
      }
    );
  };

  const MTVendors = async () => {
    let token = localStorage.getItem("token");
    await Api(`product/payout_payment_vendor_list`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200 && Response.data.code == 200) {
          setVendorList(Response.data.data);
        }
        setIsLoading(false);
      }
    );
  };

  // ✅ Add refresh function
  const refetchProducts = () => {
    setRefreshTrigger((prev) => !prev);
  };

  if (isLoading) return <LoadingState label="Loading payout vendors..." />;

  if (!productId?.length) {
    return (
      <EmptyState
        icon={<AltRouteOutlinedIcon />}
        title="No products to route"
        description="This service has no products configured, so there is no payout vendor to set."
      />
    );
  }

  return (
    <>
      {productId?.map((item: any) => (
        <PayoutComponet
          key={item._id}
          ProdectData={item}
          vendorList={vendorList}
          refetchProducts={refetchProducts}
        />
      ))}
    </>
  );
}
