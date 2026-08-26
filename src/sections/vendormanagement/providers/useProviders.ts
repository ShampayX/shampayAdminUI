import { useCallback, useEffect, useState } from "react";
// auth
import { useAuthContext } from "src/auth/useAuthContext";
//
import { Provider, SERVICE_VENDOR_LISTS } from "./providerCatalog";

// ----------------------------------------------------------------------
// Loads the provider estate once, plus which services each provider is
// published for.
//
// `vendor/get_VendorList` is the only endpoint that returns provider profiles
// and it returns the whole estate in one call - there is no get-one endpoint
// and no server-side paging - so the directory pages, searches and filters in
// memory and the detail screen reads the same list rather than refetching.
//
// Service coverage comes from the six per-service vendor catalogues in
// providerCatalog. Those return `{ vendorId, vendorName }`; nothing guarantees
// `vendorId` is the same identifier as the profile's `_id`, so a provider is
// matched on either the id or a normalised name. A provider with no match in
// any catalogue simply shows no service badges - that is a real state (it has
// been created but not published to a service), not a load failure.
// ----------------------------------------------------------------------

export type ProviderWithServices = Provider & {
  /** Service labels this provider is published for. */
  services: string[];
};

const normalise = (value?: string) =>
  String(value || "")
    .trim()
    .toLowerCase();

export function useProviders() {
  const { Api } = useAuthContext();

  const [providers, setProviders] = useState<ProviderWithServices[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  /** True when every service catalogue failed - badges are then unknown. */
  const [coverageUnavailable, setCoverageUnavailable] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    const token = localStorage.getItem("token");

    const listRes: any = await Api("vendor/get_VendorList", "GET", "", token);

    if (listRes?.status !== 200 || listRes.data.code !== 200) {
      setProviders([]);
      setError(true);
      setLoading(false);
      return;
    }

    const list: Provider[] = listRes.data.data || [];

    /* Service coverage. One call per service, all in flight together, and a
       failure on any single catalogue only costs that one badge. */
    const catalogues = await Promise.all(
      SERVICE_VENDOR_LISTS.map(async (service) => {
        const res: any = await Api(service.url, "GET", "", token);

        const ok =
          res?.status === 200 &&
          (res.data?.code === 200 || res.data?.success === true);

        return {
          label: service.label,
          ok,
          vendors: ok ? (res.data.data as any[]) || [] : [],
        };
      })
    );

    setCoverageUnavailable(catalogues.every((catalogue) => !catalogue.ok));

    const withServices: ProviderWithServices[] = list.map((provider) => {
      const id = String(provider._id);
      const name = normalise(provider.vendorName);

      const services = catalogues
        .filter(
          (catalogue) =>
            catalogue.ok &&
            catalogue.vendors.some(
              (vendor: any) =>
                String(vendor?.vendorId) === id ||
                String(vendor?._id) === id ||
                (Boolean(name) && normalise(vendor?.vendorName) === name)
            )
        )
        .map((catalogue) => catalogue.label);

      return { ...provider, services };
    });

    setProviders(withServices);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { providers, loading, error, coverageUnavailable, reload: load };
}
