library(reticulate)
library(odbc)
library(DBI)
library(readr)
library(tidyverse)
library(googlesheets4)


source_python('managed_tables/connect_teams/connecteam_data_extractor_fixed.py')


data <- read_csv('managed_tables/connect_teams/schedule_data.csv')


locations <- read_csv('managed_tables/connect_teams/job_locations.csv')

names(locations)[2] <- 'address'
names(locations)[1] <- 'job_location'


locations <- locations |>
      group_by(address) |>
      slice(1) |>
      select(address, job_location) |>
      ungroup()

data <- data |>
      left_join(locations,by = join_by(address), na_matches = "never")


data |>
      mutate(startTime =  format(startTime, "%H:%M:%S")) |>
      mutate(endTime =  format(endTime, "%H:%M:%S")) |>

      write_sheet(ss = '1JM1Wv-Pg3fejUkpAjtl1n4SQuDioBbNeZRde0C4fboU',sheet = 'connect_teams_data')

dbWriteTable(conn = con_evenly, name = "connect_teams_schedules", value = data, overwrite = TRUE)


#update retainer package from 1 retainer to 4 retainers


