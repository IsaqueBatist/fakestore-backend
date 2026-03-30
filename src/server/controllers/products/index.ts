import * as create from "./Create";
import * as deleteById from "./DeleteById";
import * as getAll from "./GetAll";
import * as getById from "./GetById";
import * as updateById from "./UpdateById";

import * as addCategory from "./AddCategory";
import * as deleteCategory from "./DeleteCategory";
import * as getAllCategories from "./GetAllCategories";

import * as addComment from "./AddComment";
import * as deleteComment from "./DeleteComment";
import * as getAllComments from "./GetAllComments";
import * as updateComment from "./UpdateComment";

export const ProductController = {
  ...create,
  ...getAll,
  ...getById,
  ...updateById,
  ...deleteById,
  ...addCategory,
  ...deleteCategory,
  ...getAllCategories,
  ...addComment,
  ...deleteComment,
  ...getAllComments,
  ...updateComment,
};
