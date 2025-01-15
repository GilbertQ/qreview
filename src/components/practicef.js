import React, { useState } from 'react';
import { Button, Typography, Checkbox, FormControlLabel, FormControl, Box } from '@mui/material';

const QuizComponent = () => {
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionsReviewed, setQuestionsReviewed] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [usedQuestions, setUsedQuestions] = useState([]);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [isReviewingWrongAnswers, setIsReviewingWrongAnswers] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [wrongAnswerLimitReached, setWrongAnswerLimitReached] = useState(0);
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      resetQuiz(data);
    };
    reader.readAsText(file);
  };

  const resetQuiz = (data) => {
    setQuizData(data);
    setUsedQuestions([]);
    setQuestionsReviewed(0);
    setCorrectAnswers(0);
    setWrongAnswers([]);
    setIsReviewingWrongAnswers(false);
    setReviewIndex(0);
    selectRandomQuestion(data);
  };

  const selectRandomQuestion = (data) => {
    const availableQuestions = data.filter((_, index) => !usedQuestions.includes(index));
    if (availableQuestions.length === 0) {
      resetQuiz(data);
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];
    const originalIndex = data.indexOf(selectedQuestion);

    setCurrentQuestion(selectedQuestion);
    setUsedQuestions([...usedQuestions, originalIndex]);
    setSelectedAnswers([]);
    setShowExplanation(false);
  };

  const handleAnswerChange = (event) => {
    const answer = event.target.value;
    setSelectedAnswers((prevSelected) =>
      prevSelected.includes(answer)
        ? prevSelected.filter((ans) => ans !== answer)
        : [...prevSelected, answer]
    );
  };

  const handleConfirm = () => {
    setShowExplanation(true);
    setQuestionsReviewed((prev) => prev + 1);

    const correctAnswersList = getCorrectAnswers(currentQuestion);
    const selectedAnswerChars = selectedAnswers.map((answer) => answer.charAt(0));

    const isCorrect = correctAnswersList.length === selectedAnswerChars.length &&
                      correctAnswersList.every((ans) => selectedAnswerChars.includes(ans));

    if (!isCorrect) {
      setWrongAnswers((prev) => [...prev, { questionDetails: currentQuestion, selectedAnswers }]);
    } else {
      setCorrectAnswers((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    if (isReviewingWrongAnswers) {
      if (reviewIndex < wrongAnswers.length - 1) {
        setReviewIndex((prev) => prev + 1);
        setCurrentQuestion(wrongAnswers[reviewIndex + 1].questionDetails);
      } else {
        setIsReviewingWrongAnswers(false);
        setReviewIndex(0);
        setWrongAnswers([]);
        if (wrongAnswerLimitReached >= 5) {
          setQuizData(null);
        } else {
          selectRandomQuestion(quizData);
        }
      }
    } else {
      selectRandomQuestion(quizData);
    }
    setSelectedAnswers([]);
    setShowExplanation(false);
  };

  const getCorrectAnswers = (question) => {
    const correctAnswerLine = question.find((line) => line.startsWith("Answer"));
    return correctAnswerLine.replace("Answer:", "").replace(".", "").split(",").map((ans) => ans.trim());
  };

  const questionText = currentQuestion?.slice(0, currentQuestion.findIndex((line) => line.startsWith("A."))).join(' ') || '';
  const answerOptions = getAnswerOptions(currentQuestion);
  const explanationText = getExplanationText(currentQuestion);
  const percentageCorrect = questionsReviewed > 0 ? ((correctAnswers / questionsReviewed) * 100).toFixed(2) : 0;
  const shouldShowRepaso = percentageCorrect < 80 && wrongAnswers.length > 5;

  if (shouldShowRepaso) {
    setWrongAnswerLimitReached(prev => prev + 1);
  }

  return (
    <Box>
      {!quizData ? (
        <Box>
          <input type="file" accept=".json" onChange={handleFileUpload} />
        </Box>
      ) : (
        <>
          {wrongAnswerLimitReached >= 5 && renderPauseIt()}
          {!shouldShowRepaso && !isReviewingWrongAnswers && wrongAnswerLimitReached < 5 && renderQuestionBox()}
          {shouldShowRepaso && !isReviewingWrongAnswers && wrongAnswerLimitReached < 5 && renderReviewPrompt()}
          {isReviewingWrongAnswers && wrongAnswerLimitReached < 5 && renderWrongAnswerReview()}
        </>
      )}
    </Box>
  );

  function renderQuestionBox() {
    return (
      <Box id="preguntas">
        <Typography variant="h6">{questionText}</Typography>
        <FormControl component="fieldset">
          {answerOptions.map((option, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={selectedAnswers.includes(option)}
                  onChange={handleAnswerChange}
                  value={option}
                  disabled={showExplanation}
                />
              }
              label={option}
            />
          ))}
        </FormControl>
        {!showExplanation ? (
          <Button variant="contained" color="success" onClick={handleConfirm}>
            Confirm
          </Button>
        ) : (
          <>
            <Button variant="contained" onClick={handleContinue}>
              Continue
            </Button>
            <Typography variant="h6" style={{ whiteSpace: 'pre-wrap' }}>
              {explanationText}
            </Typography>
          </>
        )}
        <Box mt={4} display="flex" justifyContent="space-between" width="100%">
          <Typography variant="body1">Questions: {quizData.length}</Typography>
          <Typography variant="body1">Reviewed: {usedQuestions.length-1}</Typography>
          <Typography variant="body1">Correct: {correctAnswers}</Typography>
          <Typography variant="body1">Wrong: {wrongAnswers.length}</Typography>
         </Box>
      </Box>
    );
  }

  function renderReviewPrompt() {
    return (
      <Box id="repaso">
        <Typography variant="h1">More than 5 wrong answers and a score under 80%</Typography>
        <Button variant="contained" color="primary" onClick={() => setIsReviewingWrongAnswers(true)}>
          Review Wrong Answers
        </Button>
      </Box>
    );
  }

  function renderPauseIt() {
    return (
      <Box id="repaso">
        <Typography variant="h1">You have practiced enough, please take a couple of hours off</Typography>
        <Button variant="contained" color="primary" onClick={() => {
          setQuizData(null);
          setWrongAnswerLimitReached(0);
        }}>
          Thanks and see you later.
        </Button>
      </Box>
    );
  }

  function renderWrongAnswerReview() {
    return (
      <Box id="preguntas">
        <Typography variant="h6">{questionText}</Typography>
        <FormControl component="fieldset">
          {answerOptions.map((option, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={selectedAnswers.includes(option)}
                  onChange={handleAnswerChange}
                  value={option}
                  disabled={showExplanation}
                />
              }
              label={option}
            />
          ))}
        </FormControl>
        {!showExplanation ? (
          <Button variant="contained" color="success" onClick={handleConfirm}>
            Confirm
          </Button>
        ) : (
          <>
            <Button variant="contained" onClick={handleContinue}>
              Continue
            </Button>
            <Typography variant="h6" style={{ whiteSpace: 'pre-wrap' }}>
              {explanationText}
            </Typography>
          </>
        )}
        <Box mt={4} display="flex" justifyContent="space-between" width="100%">
          <Typography variant="body1">Wrong Answer {reviewIndex} of {wrongAnswers.length-1}</Typography>
        </Box>
      </Box>
    );
  }

  function getAnswerOptions(question) {
    const answerOptions = [];
    let currentAnswer = '';

    for (const line of question || []) {
      if (/^[A-F]\./.test(line)) {
        if (currentAnswer) answerOptions.push(currentAnswer.trim());
        currentAnswer = line;
      } else if (/^Answer/.test(line)) {
        if (currentAnswer) answerOptions.push(currentAnswer.trim());
        break;
      } else if (currentAnswer) {
        currentAnswer += ' ' + line;
      }
    }
    return answerOptions;
  }

  function getExplanationText(question) {
    return (question || [])
      .slice((question || []).findIndex((line) => line.startsWith("Answer")))
      .join(' ')
      .replace('Explanation', '\n\nExplanation:\n\n');
  }
};

export default QuizComponent;