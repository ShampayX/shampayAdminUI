import { useEffect, useState, useContext } from "react";
import { useSnackbar } from "src/components/snackbar";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useAuthContext } from "src/auth/useAuthContext";
import PayoutComponet from "./PayoutComponet";
import { CategoryContext } from "./ServicesVenderSwitch";
import VendorWarnings, {
  vendorWarningsOf,
} from "src/components/VendorWarnings";
import { isOk } from "src/utils/apiResult";

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
  const [vendorWarnings, setVendorWarnings] = useState<string[]>([]);
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
            const products = Response.data.data || [];
            setProductId(products);

            // Stage 3: `POST product/getActiveVendors` is the batch form of
            // `GET product/getActiveVendor/:productId`. This used to fire one
            // request per product and let them race into the same three form
            // fields, so whichever landed last won - now it is one request and
            // the last product with routing wins deterministically.
            const productIds = products.map((item: any) => item._id);
            if (productIds.length) {
              Api(
                "product/getActiveVendors",
                "POST",
                { productIds },
                token
              ).then((BatchResponse: any) => {
                if (!isOk(BatchResponse)) return;
                const map = BatchResponse.data?.data || {};
                productIds.forEach((pid: string) => {
                  const routing = map[pid];
                  if (!routing) return;
                  setValue("neoNetworkVendor", routing.neoNetworkVendor);
                  setValue("apiUserVendor", routing.apiUserVendor);
                  setValue("directAgentVendor", routing.directAgentVendor);
                });
              });
            }

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
          // Item 3b: an empty dropdown used to be indistinguishable from a
          // broken one. `warnings` sits beside `data`, not inside it.
          setVendorWarnings(vendorWarningsOf(Response));
        }
        setIsLoading(false);
      }
    );
  };

  return (
    <>
      <VendorWarnings warnings={vendorWarnings} />
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
