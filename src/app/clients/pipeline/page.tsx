"use client";
import dynamic from "next/dynamic";
const PipelineClient = dynamic(() => import("./pipeline-client"));
export default function PipelinePage() { return <PipelineClient />; }
