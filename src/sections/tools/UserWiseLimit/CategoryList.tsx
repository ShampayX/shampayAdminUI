import { Box, Typography } from "@mui/material";
import { Category } from "./types";

interface CategoryListProps {
  loading?: boolean;
  categories: Category[];
  selectedCategory: Category | null;
  onSelect: (category: Category) => void;
}

export default function CategoryList({
  loading = false,
  categories,
  selectedCategory,
  onSelect,
}: CategoryListProps) {
  return (
    <>
      <Typography variant="h6" mb={1}>
        Categories
      </Typography>

      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {categories.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            mt={2}
          >
            No categories found
          </Typography>
        ) : (
          categories.map((category) => {
            const active = selectedCategory?._id === category._id;

            return (
              <Box
                key={category._id}
                onClick={() => onSelect(category)}
                sx={{
                  p: 1.5,
                  mb: 1,
                  borderRadius: 1,
                  cursor: "pointer",
                  bgcolor: active ? "primary.light" : "transparent",
                  transition: "bgcolor 0.2s",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Typography fontWeight={600} fontSize="0.95rem">
                  {category.category_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {category.crid_Identifier}
                </Typography>
              </Box>
            );
          })
        )}
      </Box>
    </>
  );
}
