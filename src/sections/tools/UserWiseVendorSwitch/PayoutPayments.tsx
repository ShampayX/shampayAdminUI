import { useEffect, useState, useContext } from "react";
import { useSnackbar } from "src/components/snackbar";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useAuthContext } from "src/auth/useAuthContext";
import PayoutComponet from "./PayoutComponet";
import { CategoryContext } from "./ServicesVenderSwitch";

// ----------------------------------------------------------------------

type FormValuesProps = {
  neoNetworkVendor: {
    vendorId: string;
    vendorName: string;
  };
  apiUserVendor: {
    vendorId: string;
    vendorName: string;
  };
  directAgentVendor: {
    vendorId: string;
    vendorName: string;
  };
};
interface Props {
  userId: string;
}

export default function DMT2VendorSwitch({ userId }: Props) {
  const { Api } = useAuthContext();
  const CategoryContaxt: any = useContext(CategoryContext);
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [productId, setProductId] = useState<any>([]);
  const [vendorList, setVendorList] = useState([]);
  const [isEdit, setIsEdit] = useState(false);

  // Form Controller
  const FilterSchema = Yup.object().shape({
    // activeVendor: "",
  });
  const defaultValues = {
    neoNetworkVendor: {
      vendorId: "",
      vendorName: "",
    },
    apiUserVendor: {
      vendorId: "",
      vendorName: "",
    },
    directAgentVendor: {
      vendorId: "",
      vendorName: "",
    },
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
  });

  const {
    getValues,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  useEffect(() => {
    getProductlist(CategoryContaxt?._id);
  }, []);

  const getProductlist = (val: string) => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    Api(`product/get_ProductList/${val}`, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setProductId(Response.data.data);
            Response.data.data.map((item: any) =>
              Api(`product/getActiveVendor/${item._id}`, "GET", "", token).then(
                (Response: any) => {
                  if (Response?.status == 200 && Response.data.code == 200) {
                    setValue(
                      "neoNetworkVendor",
                      Response.data.data.neoNetworkVendor
                    );
                    setValue("apiUserVendor", Response.data.data.apiUserVendor);
                    setValue(
                      "directAgentVendor",
                      Response.data.data.directAgentVendor
                    );
                  }
                }
              )
            );

            // Fetch Vendor List
            MTVendors();
          }
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

  return (
    <>
      {productId?.map((item: any) => (
        <PayoutComponet
          key={item._id}
          ProdectData={item}
          vendorList={vendorList}
          productId={productId}
          userId={userId}
        />
      ))}
    </>
  );
}
