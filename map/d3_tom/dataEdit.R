library(readr)

GDP <- read_csv("~/GitHub/InfoViz-Project/map/d3_tom/data/GDP.csv")
id <- read_csv("~/GitHub/InfoViz-Project/map/d3_tom/data/id3Country.csv")

colnames(GDP)[2:length(GDP)]

d <- data.frame()
for (i in 2:length(GDP)){
  a <- GDP[,c(1,i)]
  b <- rep(colnames(GDP)[i],nrow(a))
  c <- cbind(a,b)
  colnames(c) <- c('id','value','year')
  d <- rbind(d,c)
}


colnames(AIDS_Deaths)[1]  <- "country"

a <- merge(id,AIDS_Deaths,by = "country")

write.csv(d,'~/GitHub/InfoViz-Project/map/d3_tom/data/GDP1.csv')