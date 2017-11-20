library(readr)

AIDS_Deaths <- read_csv("~/GitHub/InfoViz-Project/map/d3_tom/data/AIDS_Deaths.csv")
id <- read_csv("~/GitHub/InfoViz-Project/map/d3_tom/data/id3Country.csv")

colnames(AIDS_Deaths)[1]  <- "country"

a <- merge(id,AIDS_Deaths,by = "country")

write.csv(a,'~/GitHub/InfoViz-Project/map/d3_tom/data/AIDS_Deaths1.csv')