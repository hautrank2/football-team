import { Construction, Hammer, SearchX, TriangleAlert } from "lucide-react";
import { PageState } from "./PageState";

export type FullPageStateProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

export const ComingSoon = ({ title = "Coming soon", description, action }: FullPageStateProps) => (
  <PageState
    icon={Construction}
    title={title}
    description={description ?? "This feature is on the way. Check back shortly."}
    action={action}
  />
);

export const InDevelopment = ({ title = "In development", description, action }: FullPageStateProps) => (
  <PageState
    icon={Hammer}
    title={title}
    description={description ?? "This page is being built."}
    action={action}
  />
);

export const NotFound = ({ title = "Page not found", description, action }: FullPageStateProps) => (
  <PageState
    icon={SearchX}
    title={title}
    description={description ?? "The page you are looking for does not exist."}
    action={action}
  />
);

export const ErrorState = ({ title = "Something went wrong", description, action }: FullPageStateProps) => (
  <PageState
    icon={TriangleAlert}
    title={title}
    description={description ?? "An unexpected error occurred. Please try again."}
    action={action}
  />
);

export { PageState } from "./PageState";
export type { PageStateProps } from "./PageState";
