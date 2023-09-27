import { marked } from "marked"
import jwt from "jsonwebtoken"
import GhostAdminAPI from '@tryghost/admin-api'
import axios, { AxiosError, AxiosRequestConfig } from "axios";

const api : GhostAdminAPI = new GhostAdminAPI({
    url: process.env.GHOST_HOST,
    version: "v5.0",
    key: process.env.GHOST_ADMIN_API_KEY
});

export const publishMarkdownToGosh = async (markdownString: string) => {
    
    const titleRegex = /^# (.+)$/m;  // Expresión regular para coincidir con la línea que comienza con #
    const match = titleRegex.exec(markdownString);

    let title = "Test post"
    let filterTitle = markdownString
    if (match) {
        title = match[1];
        console.log(title);  // Esto imprimirá "# Prueba inicial"
        filterTitle = markdownString.replace(`# ${title}`, "")
    } else {
        console.log("No se encontró un título.");
    }
    
    let htmlContent = marked.parse(filterTitle)

    return await publishREST(title, htmlContent);
}

const publishCli = async (title: string, htmlContent: string) => {
    try {
        let response = await api.posts.add(
            {"title": title, "html": htmlContent},
            {"source": 'html'} // Tell the API to use HTML as the content source, instead of mobiledoc
        )
        console.log(response)
        return response.url
    } catch (e) {
        console.error(e)
    }
}

const publishREST = async (title: string, htmlContent: string) => {
    let data = {
        "posts": [
            {
                "title": title,
                "html": htmlContent,
                "status": "published"
            }
        ]
    }

    let token = getPublishToken()
    console.log(token)
    let config : AxiosRequestConfig = {
        headers:  { 
            Authorization: `Ghost ${token}`,
            "Accept-Version": "v5.0"
        }
    }

    const url = `${process.env.GHOST_HOST}/ghost/api/admin/posts/?source=html`

    try{ 
        let response : any = await axios.post(url, data, config)
        console.log("Creado artículo")
        console.log((response as any)?.data)
        let responseUrl = (response as any)?.data.posts[0].url
        console.log("UrL is ", responseUrl)
        return responseUrl
    } catch(e) {
        console.log(url, e)
    }

    return "no-creado"
}

const getPublishToken = () => {
    let key : string = process.env.GHOST_ADMIN_API_KEY as string;
    const [id, secret] = key.split(':');

    // Create the token (including decoding secret)
    const token = jwt.sign({}, Buffer.from(secret, 'hex'), {
        keyid: id,
        algorithm: 'HS256',
        expiresIn: '5m',
        audience: `/admin/`
    });

    return token
}

