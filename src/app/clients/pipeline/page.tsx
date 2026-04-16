"use client";
import dynamic from "next/dynamic";
const PipelineClient = dynamic(() => import("./pipeline-client"), { ssr: false });
export default function PipelinePage() { return <PipelineClient />; }
