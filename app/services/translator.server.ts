import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers"

interface GetTranslationOptions {
    text: string
    sourceLangCode: string
    targetLangCode: string
}

const region = process.env.AWS_TRANSLATE_REGION

export async function getTranslationForLanguage(options: GetTranslationOptions): Promise<string | undefined> {
    try {
        const credentials = fromNodeProviderChain({
            //providerId: 'sandbox',
            profile: 'sandbox',
        });

        const client = new TranslateClient({ 
          region,
          credentials,
        });

        const command = new TranslateTextCommand({
            SourceLanguageCode: options.sourceLangCode,
            TargetLanguageCode: options.targetLangCode,
            Text: options.text,
        });
    
        const response = await client.send(command)

        return response.TranslatedText
    } catch (err) {
        throw err
    }
}