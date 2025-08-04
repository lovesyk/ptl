import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { Textarea } from "~/components/ui/textarea";
import { useDebounce } from "use-debounce";
import { api } from "~/api";
import { toast } from "sonner";
import { Toaster } from "~/components/ui/sonner";
import { Button } from "~/components/ui/button";

enum TranslationLanguage {
  "ドイツ語" = "de-DE",
  "英語 (アメリカ)" = "en-US",
  "英語 (イギリス)" = "en-GB",
  "日本語" = "ja-JP",
  "ロシア語" = "ru-RU",
  "中国語 (簡体)" = "zh-CN"
}

export enum WritingStyle {
  "タメ口" = "casual",
  "敬語" = "formal",
  "SNS" = "social media",
  "新聞" = "newspaper",
}

export function Translator() {
  const [from, setFrom] = useState<TranslationLanguage>()
  const [to, setTo] = useState<TranslationLanguage>(TranslationLanguage['英語 (アメリカ)'])

  const updateFrom = useCallback((value: string) => {
    const newFrom = Object.values(TranslationLanguage).find(x => x === value)
    setFrom(newFrom);
    if (to == newFrom && from != null) {
      setTo(from)
    }
  }, [from, to])

  const updateTo = useCallback((value: string) => {
    const newTo = Object.values(TranslationLanguage).find(x => x === value)
    if (newTo) {
      setTo(newTo);
    }
    if (from == newTo && to != null) {
      setFrom(to)
    }
  }, [to, from])

  const [style, setStyle] = useState<WritingStyle>()

  const updateStyle = useCallback((value: string) => {
    const newStyle = Object.values(WritingStyle).find(x => x === value)
    setStyle(newStyle);
  }, [])

  const [input, setInput] = useState('');
  const [inputDebounced] = useDebounce(input, 500);
  const [output, setOutput] = useState('');
  const [translatedFromString, setTranslatedFromString] = useState('')

  const updateInput = useCallback(({ target: { value } }: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(value)
  }, [])

  const updateOutput = useCallback(async () => {
    if (inputDebounced && to) {
      let errorMessage: string | undefined;
      try {
        const { data, error } = await api.POST('/translation', { body: { from, to, style, input: inputDebounced, api: 'ja-JP' } })
        if (data) {
          setOutput(data.output);
          setTranslatedFromString(data.from ?? '');
        } else {
          errorMessage = error.message;
        }
      } catch (e: unknown) {
        console.warn(e);
        errorMessage = 'システムエラーが発生しました'
      }

      if (errorMessage) {
        toast('翻訳に失敗しました', {
          description: errorMessage,
          closeButton: false,
        })
      }
    }
  }, [from, to, style, inputDebounced])

  useEffect(() => {
    updateOutput();
  }, [updateOutput])

  const swapLanguages = useCallback(() => {
    const newFrom = to ?? from;
    const translatedFrom = Object.values(TranslationLanguage).find(x => x === translatedFromString);
    const newTo = from ?? translatedFrom ?? to;
    setFrom(newFrom);
    setTo(newTo);
  }, [to, from, translatedFromString])

  return (
    <main className="flex items-center justify-center py-16 h-dvh">
      <Toaster />
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0 h-full">
        <header className="flex flex-col items-center gap-9">
          <h1 className="text-4xl">pTL</h1>
        </header>
        <div className="max-w-[1200px] w-full px-4 h-full min-h-0">
          <nav className="flex flex-col border border-gray-200 dark:border-gray-700 h-full">
            <div className="flex flex-row justify-center border-b-1 border-b-gray-200 dark:border-b-gray-700">
              <Select value={from ?? 'auto'} onValueChange={updateFrom}>
                <SelectTrigger className="basis-full md:min-w-[220px] rounded-none border-y-0 border-l-0 md:border-l-1 border-r-1 shadow-none md:text-md font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='auto'>言語を検出する{translatedFromString ? ` [${translatedFromString}]` : ''}</SelectItem>
                  {Object.keys(TranslationLanguage).map(x =>
                    <SelectItem key={TranslationLanguage[x as keyof typeof TranslationLanguage]} value={TranslationLanguage[x as keyof typeof TranslationLanguage]}>{x}</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Button onClick={swapLanguages} variant='ghost' className="rounded-none border-r-1">⇄</Button>
              <Select value={to ?? ''} onValueChange={updateTo}>
                <SelectTrigger className="basis-full md:min-w-[220px] rounded-none border-y-0 border-l-0 border-r-0 md:border-r-1 shadow-none md:text-md font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(TranslationLanguage).map(x =>
                    <SelectItem key={TranslationLanguage[x as keyof typeof TranslationLanguage]} value={TranslationLanguage[x as keyof typeof TranslationLanguage]}>{x}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-row justify-end border-b-1 border-b-gray-200 dark:border-b-gray-700">
              <Select value={style ?? 'keep'} onValueChange={updateStyle}>
                <SelectTrigger size="sm" className="w-[220px] rounded-none border-y-0 border-l-1 border-r-0 shadow-none md:text-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='keep'>文体を維持する</SelectItem>
                  {Object.keys(WritingStyle).map(x =>
                    <SelectItem key={WritingStyle[x as keyof typeof WritingStyle]} value={WritingStyle[x as keyof typeof WritingStyle]}>{x}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap md:flex-row md:flex-nowrap grow min-h-0 h-full">
              <Textarea placeholder="翻訳するには文書を入力してください" value={input} onChange={updateInput} className="border-t-0 border-b-1 md:border-b-0 border-l-0 md:border-r-1 rounded-none shadow-none !text-lg resize-none h-[50%] md:h-full" />
              <Textarea value={output} readOnly={true} className="border-0 rounded-none shadow-none !text-lg resize-none h-[50%] md:h-full" />
            </div>
          </nav>
        </div>
      </div>
    </main>
  );
}
