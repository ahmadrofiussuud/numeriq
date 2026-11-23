import {defineConfig} from "@playwright/test";
export default defineConfig({testDir:"./tests/auth",workers:1,use:{baseURL:"http://127.0.0.1:3000",headless:true},webServer:{command:"npm run start",url:"http://127.0.0.1:3000",reuseExistingServer:false,stdout:"pipe",stderr:"pipe"},reporter:"list"});
