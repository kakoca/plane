import { Editor } from "@tiptap/core";

export type TAIMenuProps = {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
};

export type TAIHandler = {
  menu?: (props: TAIMenuProps) => React.ReactNode;
};
