import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../supabase/baseQuery";

interface GenContentReq {
    idea: string | undefined,
    feedback: string | undefined;
    content: string | undefined;
}

interface GenContentRes {
    title?: string;
    content?: string;
    excerpt?: string;
    seo_meta_description?: string;
    seo_slug?: string;
    seo_title_tag?: string;
}

const generateContentApi = createApi({
    reducerPath: "generate",
    baseQuery,
    endpoints: (builder) => ({
        // -----------------------STORAGE DIRECT BLOB UPLOAD-------------------------
        generateContent: builder.mutation<GenContentRes, {channel_id: string; gen_content: GenContentReq}>({
            query: ({ channel_id , gen_content }) => ({
                url: `functions/v1/api/generate-content/${channel_id}/initial`,
                method: "POST",
                body: gen_content
            })
        }),
        // ----------------------GENERATE CONTENT WITH SEO-----------------------------
        generateContentWithSEO: builder.mutation<GenContentRes, {channel_id: string; gen_content: GenContentReq}>({
            query: ({ channel_id , gen_content }) => ({
                url: `functions/v1/api/generate-content/${channel_id}/generate-full`,
                method: "POST",
                body: gen_content
            })
        }),
    })
})

export const {
    useGenerateContentMutation,
    useGenerateContentWithSEOMutation,
} = generateContentApi;
export { generateContentApi };