import { memo } from "react";
// @mui
import { Stack } from "@mui/material";
// utils
import { hideScrollbarY } from "../../../utils/cssStyles";
//
import { NavSectionProps, NavListProps } from "../types";
import NavList from "./NavList";
import Scrollbar from "src/components/scrollbar/Scrollbar";

// ----------------------------------------------------------------------

function NavSectionHorizontal({ data, sx, ...other }: NavSectionProps) {
  return (
    <Scrollbar sx={{ maxWidth: "100%" }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          // mx: "auto",
          pb: 2,
          // ...hideScrollbarY,
          ...sx,
        }}
        {...other}
        
      >
        {data.map((group) => (
          <Items key={group.subheader} items={group.items} />
        ))}
      </Stack>
    </Scrollbar>
  );
}

export default memo(NavSectionHorizontal);

// ----------------------------------------------------------------------

type ItemsProps = {
  items: NavListProps[];
};

function Items({ items }: ItemsProps) {
  return (
    <>
      {items.map((list) => (
        <NavList
          key={list.title + list.path}
          data={list}
          depth={1}
          hasChild={!!list.children}
        />
      ))}
    </>
  );
}
