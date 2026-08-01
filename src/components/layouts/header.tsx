import { Hexagon } from "lucide-react";
import Link from "next/link";
import { Typography } from "@/components/ui/typography";
import { ROUTES } from "@/utils/routing";
import Nav from "./nav";

const Header = () => (
  <header className="flex px-4 lg:px-16 justify-between items-center w-full fixed top-0 h-16 border-b z-20 bg-background/90">
    <Link href={ROUTES.home} className="header-brand flex items-center gap-2">
      <Hexagon className="size-6 text-primary" />
      <Typography variant="h3" className="uppercase">
        App
      </Typography>
    </Link>
    <Nav />
  </header>
);

export default Header;
