"use client";

import { Outlet } from "react-router";
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
// local components
import { ProjectGraphHeader } from "./header";
import { GraphMobileHeader } from "./mobile-header";

export default function ProjectGraphLayout() {
  return (
    <>
      <AppHeader header={<ProjectGraphHeader />} mobileHeader={<GraphMobileHeader />} />
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
    </>
  );
}