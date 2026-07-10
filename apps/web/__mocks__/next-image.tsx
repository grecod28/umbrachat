import React from "react";

const MockImage = ({
  priority: _priority,
  fill: _fill,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  priority?: boolean;
  fill?: boolean;
}) => {
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  return <img {...props} />;
};

export default MockImage;
