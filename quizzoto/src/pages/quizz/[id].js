import { FormControl, RadioGroup, FormControlLabel, Radio, Button } from "@mui/material";
import Head from "next/head";
import { set, useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import fetchQuizz from '../../../lib/fetchQuizz';
import QuizzTimeline from '@/components/quizzTimeline';
import Box from '@mui/material/Box';

export default function Quizz() {
  const [quizz, setQuizz] = useState()

  const router = useRouter()

  useEffect(() => {
    if(!router.query.id)  {
      return;
    }

    const getData = async () => {
      const jsonData = await fetchQuizz(router.query.id);
      setQuizz(jsonData)
    }
    getData()
  }, [router.query.id]);

  const { register, handleSubmit } = useForm();
  
  const onSubmit = async(data) => {
    const result = await setQuizzResult(router.query.id, data)
    router.push({
      pathname: `/result/${result._id}`,
    })
  }
  return (
    <>
      <Head>
        <title>Quizzoto - Quizz</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
				<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
				<link rel="stylesheet" href="/quizz.css" />
      </Head>
      <main>
				{quizz?.statusCode ? (
            <p>Merci de fournir un id de quizz correct dans l'URL.</p>
          ) : quizz ? (
					<Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
						<Box gridColumn="span 12">
                <h1>{quizz.quizzTitle}</h1>
                <h2>{quizz.quizzDescription}</h2>
						</Box>
						<Box gridColumn="span 8">
							<form onSubmit={handleSubmit(onSubmit)}>
								{quizz.questions.map((q, index) => {
                    return (
										<div key={index}>
                        <h3>{q.questionTitle}</h3>
											<Question question={q} register={register} />
                      </div>
									);
								})}
              </form>
							<Button type="submit" variant="contained">
								Fin
							</Button>
							</form>
						</Box>
						<Box gridColumn="span 4">
							<QuizzTimeline quizz={quizz} />
						</Box>
					</Box>
          ) : (
            <h2>Chargement...</h2>
				)}
      </main>
    </>
  );
}
