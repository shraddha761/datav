// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { Role } from "./role"

export const globalTeamId = 1

export interface Team {
    id : number 
    name: string
    isPublic?: boolean
    brief?: string
    createdBy?: string
    createdById?: number
    memberCount?: number
    role?: Role
    allowGlobal?: boolean
}

export interface TeamMember {
    id: number 
    teamId?: number
    username: string 
    created: string 
    role: Role 
}

export interface SideMenu {
    teamId : number
    isPublic?: boolean
    teamName? : string
    brief? : string
    data: MenuItem[]
}

export interface MenuItem {
    url: string
    title: string
    dashboardId: string
    icon?: string
    children?: MenuItem[]
}