import React, { useState } from 'react';
import { Button, Typography, Checkbox, FormControlLabel, FormControl, Box } from '@mui/material';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LoopIcon from '@mui/icons-material/Loop';
import "./practicep.css";

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
  const [again, setagain] = useState(0);
  const [noMoreQuestions, setNoMoreQuestions] = useState(false);
  const [totalWrongAnswers, setTotalWrongAnswers] = useState(0);
  const [TwrongAnswers, setTWrongAnswers] = useState([]);
  const WRONG_ANSWER_LIMIT = 4;


  const finalScore = () => {
    const questionDetailsArray = TwrongAnswers.map(answer => answer.questionDetails);
    const jsonContent = JSON.stringify(questionDetailsArray, null, 2);
    
      const fileName = `wA${new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}.json`;
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    const scorePercentage = (((usedQuestions.length - totalWrongAnswers) / usedQuestions.length) * 100).toFixed(2);
    return (
      <Typography>Score: {scorePercentage} %</Typography>
    );
  };

  if (again > WRONG_ANSWER_LIMIT) {
    const getBackgroundColor = (length) => {
      if (length < 275) {
        return 'yellow';
      } else if (length >= 275 && length <= 467) {
        return 'lightblue';
      } else {
        return 'green';
      }
    };
    return (
      <Box>
        <Typography variant="h6">{`Those were ${again} times`}</Typography>        
        <Typography
          variant="h1"
          style={{
            color: 'grey',
            backgroundColor: getBackgroundColor(usedQuestions.length),
            padding: '10px',
          }}
        >
          {`But hey, you got ${usedQuestions.length} reviewed questions`}
        </Typography>
        {finalScore()}
        <Typography>Rest some time</Typography>
        <Typography>to improve your Learning</Typography>
        <Typography>Thanks!</Typography>
      </Box>
    );
  }

  if (noMoreQuestions) {
    return (
      <Box>
        <Typography>Congrats!</Typography>
        <Typography variant="h6">End of the Road</Typography>
        <Typography
          variant="h1"
          style={{
            color: 'white',
            backgroundColor: '#0047AB',
            padding: '10px',
          }}
        >
          {`${usedQuestions.length} reviewed`}
        </Typography>
        {finalScore()}
        </Box>
    );
  }

  const startReviewMode = () => {
    setIsReviewingWrongAnswers(true);
    setReviewIndex(0);
    setCurrentQuestion(wrongAnswers[0].questionDetails);
    setSelectedAnswers([]);
    setShowExplanation(false);
  };
  
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
    setTWrongAnswers([]);
    setIsReviewingWrongAnswers(false);
    setReviewIndex(0);
    setagain(0);
    setTotalWrongAnswers(0); 
    selectRandomQuestion(data);  
  };

  const selectRandomQuestion = (data) => {
    const availableQuestions = data.filter((_, index) => !usedQuestions.includes(index));
    if (availableQuestions.length === 0) {
      setNoMoreQuestions(true);  
      return; 
    }
    else{
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];
    const originalIndex = data.indexOf(selectedQuestion);

    setCurrentQuestion(selectedQuestion);
    setUsedQuestions([...usedQuestions, originalIndex]);
    setSelectedAnswers([]);
    setShowExplanation(false);
  }
  };

  const handleAnswerChange = (event) => {
    const answer = event.target.value;
    setSelectedAnswers((prevSelected) =>
      prevSelected.includes(answer)
        ? prevSelected.filter((ans) => ans !== answer)
        : [...prevSelected, answer]
    );
  }
  ;

  const handleConfirm = () => {
    const correctAnswersList = getCorrectAnswers(currentQuestion);
    const selectedAnswerChars = selectedAnswers.map((answer) => answer.charAt(0));

    const isCorrect = correctAnswersList.length === selectedAnswerChars.length &&
                      correctAnswersList.every((ans) => selectedAnswerChars.includes(ans));

    setQuestionsReviewed((prev) => prev + 1);

    if (!isCorrect) {        
        setWrongAnswers((prev) => [...prev, { questionDetails: currentQuestion, selectedAnswers }]);
        setTotalWrongAnswers((prev) => prev + 1);
        setTWrongAnswers((prev) => [...prev, { questionDetails: currentQuestion, selectedAnswers }]);         
        setShowExplanation(true);  
    } else {
        setCorrectAnswers((prev) => prev + 1);
        handleContinue(); 
  }
};

const handleContinue = () => {
  if (isReviewingWrongAnswers) {
    setReviewIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex < wrongAnswers.length) {
        setCurrentQuestion(wrongAnswers[nextIndex].questionDetails);
      } else {
        setIsReviewingWrongAnswers(false);
        setReviewIndex(0);
        setWrongAnswers([]);
        selectRandomQuestion(quizData);
        setagain((prev) => prev + 1);
      }
      setSelectedAnswers([]); 
      setShowExplanation(false); 
      return nextIndex;
    });
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
  //const questionText = currentQuestion?.slice(0, currentQuestion.findIndex((line) => line.startsWith("A."))).join('\n') || '';
  const answerOptions = getAnswerOptions(currentQuestion);
  const explanationText = getExplanationText(currentQuestion);
  const percentageCorrect = questionsReviewed > 0 ? ((correctAnswers / questionsReviewed) * 100).toFixed(2) : 0;
  const shouldShowRepaso = percentageCorrect < 90 && wrongAnswers.length > 2;
  return (
    <Box>
      {!quizData ? (
        <Box>
        <input type="file" accept=".json" onChange={handleFileUpload} />
        <div>
        <p>Structure of the JSON file:</p>
      <p style={{ whiteSpace: 'pre' }}>
        {`    [													
                [                                                       
                  "Question 1: Is this a question?",                     
                  "A. Yes, it is a question.",                          
                  "B. No, it isn't a question.",                        
                  "C. I don't know.",                                    
                  "Answer: A.",                                          
                  "Explanation",                                        
                  "Clearly",                                            
                  "it is a question."                                    
                ],                                                      
                [                                                       
                  "Question 20: Select two known Sci-Fi writers:",       
                  "A. Wolfgang Amadeus Mozart.",                         
                  "B. Isaac Asimov.",                                    
                  "C. Arthur C. Clarke.",                                
                  "D. Antonio Vivaldi.",                                 
                  "Answer: B, C.",                                       
                  "Explanation",                                         
                  "These are some well-known",                            
                  "writers of this genre."                               
                ]                                                        
        ]`}
      </p>
</div>
      </Box>
      
      ) : (
        <>
          {!shouldShowRepaso && !isReviewingWrongAnswers && renderQuestionBox()}
          {shouldShowRepaso && !isReviewingWrongAnswers && renderReviewPrompt()}
          {isReviewingWrongAnswers && renderWrongAnswerReview()}
        </>
      )}
    </Box>
  );

  function renderQuestionBox() {
    return (
      <Box id="preguntas">
       <Typography variant="h6" className="text-container">
  {questionText}
</Typography>
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
<Box mt={4} display="flex" justifyContent="space-between" width="100%" alignItems="center">
  <Typography variant="body1" display="flex" alignItems="center">
    {quizData.length} <FormatListBulletedIcon fontSize="small" sx={{ ml: 0.5 }} />
  </Typography>
  <Typography variant="body1" display="flex" alignItems="center">
    {usedQuestions.length-1} <SearchIcon fontSize="small" sx={{ ml: 0.5 }} />
  </Typography>
  <Typography variant="body1" display="flex" alignItems="center">
    {correctAnswers} <CheckCircleIcon fontSize="small" sx={{ ml: 0.5 }} />
  </Typography>
  <Typography variant="body1" display="flex" alignItems="center">
    {wrongAnswers.length} <CancelIcon fontSize="small" sx={{ ml: 0.5 }} />
  </Typography>
  <Typography variant="body1" display="flex" alignItems="center">
    {again} <LoopIcon fontSize="small" sx={{ ml: 0.5 }} />
  </Typography>
  <Typography variant="body1" display="flex" alignItems="center">
    {percentageCorrect} <EmojiEventsIcon fontSize="small" sx={{ ml: 0.5 }} />
  </Typography>
</Box>
      </Box>
    );
  }

  function renderReviewPrompt() {
    return (
      <Box id="repaso">
        <Typography variant="h6">{questionText}</Typography>
          <Typography variant="h6" style={{ whiteSpace: 'pre-wrap' }}>
          <FormControl component="fieldset">
          {answerOptions.map((option, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={selectedAnswers.includes(option)}
                  onChange={handleAnswerChange}
                  value={option}
                  disabled={true}
                />
              }
              label={option}
            />
          ))}
        </FormControl>
            </Typography>
            <Typography variant="h6" style={{ whiteSpace: 'pre-wrap' }}>
              {explanationText}
            </Typography>
            
        <Button variant="contained" color="primary" onClick={startReviewMode}>Review Time!</Button>
        <Typography variant="h3">Those were {wrongAnswers.length} wrong answers and a score under 90%</Typography>
      </Box>
    );
  }

  function renderWrongAnswerReview() {
    const currentReview = wrongAnswers[reviewIndex];
    const questionText = currentReview?.questionDetails.slice(0, currentReview?.questionDetails.findIndex((line) => line.startsWith("A."))).join(' ') || '';
    const answerOptions = getAnswerOptions(currentReview?.questionDetails);
    const explanationText = getExplanationText(currentReview?.questionDetails);
  
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
          <Typography variant="body1">
            {!showExplanation && `To review: ${wrongAnswers.length - reviewIndex}`}
          </Typography>
        </Box>
      </Box>
    );
  }
  

  function getAnswerOptions(question) {
    const answerOptions = [];
    let currentAnswer = '';

    for (const line of question || []) {
      if (/^[A-Z]\./.test(line)) {
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