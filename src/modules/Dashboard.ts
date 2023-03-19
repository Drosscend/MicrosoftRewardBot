export interface apiResponse {
    dashboard: Dashboard;
}

interface Dashboard {
    userStatus: UserStatus;
    promotionalItem: null;
    dailySetPromotions: { [key: string]: Promotion[] };
    streakPromotion: StreakPromotion;
    streakBonusPromotions: StreakBonusPromotion[];
    punchCards: PunchCard[];
    dashboardFlights: DashboardFlights;
    morePromotions: MorePromotion[];
    suggestedRewards: SuggestedReward[];
    coachMarks: CoachMarks;
    welcomeTour: WelcomeTour;
}

export interface CoachMarks {
    streaks: WelcomeTour;
}

export interface WelcomeTour {
    promotion: DashboardImpression | null;
    slides: Slide[];
}

export interface DashboardImpression {
    name: null | string;
    priority: number;
    attributes: { [key: string]: string } | null;
    offerId: string;
    complete: boolean;
    counter: number;
    activityProgress: number;
    activityProgressMax: number;
    pointProgressMax: number;
    pointProgress: number;
    promotionType: string;
    promotionSubtype: string;
    title: string;
    extBannerTitle: string;
    titleStyle: string;
    theme: string;
    description: string;
    extBannerDescription: string;
    descriptionStyle: string;
    showcaseTitle: string;
    showcaseDescription: string;
    imageUrl: string;
    dynamicImage: string;
    smallImageUrl: string;
    backgroundImageUrl: string;
    showcaseBackgroundImageUrl: string;
    showcaseBackgroundLargeImageUrl: string;
    promotionBackgroundLeft: string;
    promotionBackgroundRight: string;
    iconUrl: string;
    animatedIconUrl: string;
    animatedLargeBackgroundImageUrl: string;
    destinationUrl: string;
    linkText: string;
    hash: string;
    activityType: string;
    isRecurring: boolean;
    isHidden: boolean;
    isTestOnly: boolean;
    isGiveEligible: boolean;
    level: string;
    slidesCount: number;
    legalText: string;
    legalLinkText: string;
    benefits?: Benefit[];
    supportedLevelKeys?: string[];
    supportedLevelTitles?: string[];
    supportedLevelTitlesMobile?: string[];
    activeLevel?: string;
}

export interface Benefit {
    key: string;
    text: string;
    url: null | string;
    helpText: null | string;
    supportedLevels: SupportedLevels;
}

export interface SupportedLevels {
    level1?: string;
    level2: string;
    level2XBoxGold: string;
}

export interface Slide {
    slideShowTourId: string;
    id: number;
    title: string;
    image2Title: null;
    image3Title: null;
    image4Title: null;
    description: string;
    image2Description: null;
    image3Description: null;
    image4Description: null;
    imageUrl: null;
    image2Url: null;
    image3Url: null;
    image4Url: null;
    layout: null;
    actionButtonText: null;
    actionButtonUrl: null;
    foregroundImageUrl: null;
    taggedItem: string;
    backLink: null;
    nextLink: CloseLink;
    closeLink: CloseLink;
    footnote: null;
    slideVisited: boolean;
}

export interface CloseLink {
    text: null | string;
    url: null | string;
}

export interface Promotion {
    name: string;
    priority: number;
    attributes: DailySetPromotionAttributes;
    offerId: string;
    complete: boolean;
    counter: number;
    activityProgress: number;
    activityProgressMax: number;
    pointProgressMax: number;
    pointProgress: number;
    promotionType: Type;
    promotionSubtype: string;
    title: string;
    extBannerTitle: string;
    titleStyle: string;
    theme: string;
    description: string;
    extBannerDescription: string;
    descriptionStyle: string;
    showcaseTitle: string;
    showcaseDescription: string;
    imageUrl: string;
    dynamicImage: string;
    smallImageUrl: string;
    backgroundImageUrl: string;
    showcaseBackgroundImageUrl: string;
    showcaseBackgroundLargeImageUrl: string;
    promotionBackgroundLeft: string;
    promotionBackgroundRight: string;
    iconUrl: string;
    animatedIconUrl: string;
    animatedLargeBackgroundImageUrl: string;
    destinationUrl: string;
    linkText: string;
    hash: string;
    activityType: string;
    isRecurring: boolean;
    isHidden: boolean;
    isTestOnly: boolean;
    isGiveEligible: boolean;
    level: string;
    slidesCount: number;
    legalText: string;
    legalLinkText: string;
}

export interface DailySetPromotionAttributes {
    image: string;
    small_image: string;
    bg_image: string;
    sc_bg_image: string;
    sc_bg_large_image: string;
    icon: string;
    state: State;
    title: string;
    description: string;
    link_text: string;
    destination: string;
    type: Type;
    daily_set_date?: string;
    animated_icon?: string;
    max: string;
    progress: string;
    complete: GiveEligible;
    offerid: string;
    give_eligible: GiveEligible;
    parentPunchcards?: string;
    'classification.MatchCriteria'?: string;
    'classification.Products'?: string;
}

export enum GiveEligible {
    False = 'False',
    True = 'True',
}

export enum State {
    Complete = 'Complete',
    Default = 'Default',
}

export enum Type {
    Appstore = 'appstore',
    Quiz = 'quiz',
    Urlreward = 'urlreward',
}

export interface DashboardFlights {
    dashboardbannernav: string;
    give_eligible: GiveEligible;
    destination: string;
}

export interface MorePromotion {
    name: string;
    priority: number;
    attributes: MorePromotionAttributes;
    offerId: string;
    complete: boolean;
    counter: number;
    activityProgress: number;
    activityProgressMax: number;
    pointProgressMax: number;
    pointProgress: number;
    promotionType: PromotionType;
    promotionSubtype: string;
    title: string;
    extBannerTitle: string;
    titleStyle: string;
    theme: string;
    description: string;
    extBannerDescription: string;
    descriptionStyle: string;
    showcaseTitle: Title;
    showcaseDescription: string;
    imageUrl: string;
    dynamicImage: string;
    smallImageUrl: string;
    backgroundImageUrl: string;
    showcaseBackgroundImageUrl: string;
    showcaseBackgroundLargeImageUrl: string;
    promotionBackgroundLeft: string;
    promotionBackgroundRight: string;
    iconUrl: string;
    animatedIconUrl: string;
    animatedLargeBackgroundImageUrl: string;
    destinationUrl: string;
    linkText: string;
    hash: string;
    activityType: string;
    isRecurring: boolean;
    isHidden: boolean;
    isTestOnly: boolean;
    isGiveEligible: boolean;
    level: string;
    slidesCount: number;
    legalText: string;
    legalLinkText: string;
}

export interface MorePromotionAttributes {
    image: string;
    small_image: string;
    bg_image: string;
    sc_bg_image: string;
    sc_bg_large_image: string;
    icon: string;
    state: State;
    title: string;
    description: string;
    link_text: string;
    destination: string;
    type?: Type;
    animated_icon: string;
    max: string;
    progress: string;
    complete: GiveEligible;
    offerid: string;
    give_eligible: GiveEligible;
    layout?: string;
    schemaName?: string;
    sc_title?: Title;
    sc_description?: string;
    promotional?: GiveEligible;
    offer_counter?: string;
    is_wot?: GiveEligible;
    activity_max?: string;
    activity_progress?: string;
    daily_set_date?: string;
}

export enum Title {
    Collecte = 'Collecte',
    Empty = '',
    Objectif = 'Objectif',
}

export enum PromotionType {
    Empty = '',
    Quiz = 'quiz',
    Urlreward = 'urlreward',
}

export interface PunchCard {
    name: string;
    parentPromotion: ParentPromotion;
    childPromotions: Promotion[];
}

export interface ParentPromotion {
    name: string;
    priority: number;
    attributes: ParentPromotionAttributes;
    offerId: string;
    complete: boolean;
    counter: number;
    activityProgress: number;
    activityProgressMax: number;
    pointProgressMax: number;
    pointProgress: number;
    promotionType: string;
    promotionSubtype: string;
    title: string;
    extBannerTitle: string;
    titleStyle: string;
    theme: string;
    description: string;
    extBannerDescription: string;
    descriptionStyle: string;
    showcaseTitle: string;
    showcaseDescription: string;
    imageUrl: string;
    dynamicImage: string;
    smallImageUrl: string;
    backgroundImageUrl: string;
    showcaseBackgroundImageUrl: string;
    showcaseBackgroundLargeImageUrl: string;
    promotionBackgroundLeft: string;
    promotionBackgroundRight: string;
    iconUrl: string;
    animatedIconUrl: string;
    animatedLargeBackgroundImageUrl: string;
    destinationUrl: string;
    linkText: string;
    hash: string;
    activityType: string;
    isRecurring: boolean;
    isHidden: boolean;
    isTestOnly: boolean;
    isGiveEligible: boolean;
    level: string;
    slidesCount: number;
    legalText: string;
    legalLinkText: string;
}

export interface ParentPromotionAttributes {
    image: string;
    small_image: string;
    bg_image: string;
    sc_bg_image: string;
    sc_bg_large_image: string;
    icon: string;
    state: State;
    title: string;
    description: string;
    link_text: string;
    destination: string;
    type: string;
    max: string;
    progress: string;
    complete: GiveEligible;
    offerid: string;
    'classification.PunchcardEndDate': Date;
    'classification.Template': string;
    'classification.TitleText': string;
    'classification.DescriptionText': string;
    'classification.PunchcardChildrenCount': string;
    give_eligible: GiveEligible;
    points_total?: string;
}

export interface StreakBonusPromotion {
    name: string;
    priority: number;
    attributes: StreakBonusPromotionAttributes;
    offerId: string;
    complete: boolean;
    counter: number;
    activityProgress: number;
    activityProgressMax: number;
    pointProgressMax: number;
    pointProgress: number;
    promotionType: string;
    promotionSubtype: string;
    title: string;
    extBannerTitle: string;
    titleStyle: string;
    theme: string;
    description: string;
    extBannerDescription: string;
    descriptionStyle: string;
    showcaseTitle: string;
    showcaseDescription: string;
    imageUrl: string;
    dynamicImage: string;
    smallImageUrl: string;
    backgroundImageUrl: string;
    showcaseBackgroundImageUrl: string;
    showcaseBackgroundLargeImageUrl: string;
    promotionBackgroundLeft: string;
    promotionBackgroundRight: string;
    iconUrl: string;
    animatedIconUrl: string;
    animatedLargeBackgroundImageUrl: string;
    destinationUrl: string;
    linkText: string;
    hash: string;
    activityType: string;
    isRecurring: boolean;
    isHidden: boolean;
    isTestOnly: boolean;
    isGiveEligible: boolean;
    level: string;
    slidesCount: number;
    legalText: string;
    legalLinkText: string;
}

export interface StreakBonusPromotionAttributes {
    hidden: GiveEligible;
    type: string;
    title: string;
    description: string;
    image: string;
    animated_icon: string;
    activity_progress: string;
    activity_max: string;
    bonus_earned?: string;
    break_description?: string;
    give_eligible: GiveEligible;
    destination: string;
    complete_description?: string;
}

export interface StreakPromotion {
    lastUpdatedDate: Date;
    breakImageUrl: string;
    lifetimeMaxValue: number;
    bonusPointsEarned: number;
    name: string;
    priority: number;
    attributes: StreakPromotionAttributes;
    offerId: string;
    complete: boolean;
    counter: number;
    activityProgress: number;
    activityProgressMax: number;
    pointProgressMax: number;
    pointProgress: number;
    promotionType: string;
    promotionSubtype: string;
    title: string;
    extBannerTitle: string;
    titleStyle: string;
    theme: string;
    description: string;
    extBannerDescription: string;
    descriptionStyle: string;
    showcaseTitle: string;
    showcaseDescription: string;
    imageUrl: string;
    dynamicImage: string;
    smallImageUrl: string;
    backgroundImageUrl: string;
    showcaseBackgroundImageUrl: string;
    showcaseBackgroundLargeImageUrl: string;
    promotionBackgroundLeft: string;
    promotionBackgroundRight: string;
    iconUrl: string;
    animatedIconUrl: string;
    animatedLargeBackgroundImageUrl: string;
    destinationUrl: string;
    linkText: string;
    hash: string;
    activityType: string;
    isRecurring: boolean;
    isHidden: boolean;
    isTestOnly: boolean;
    isGiveEligible: boolean;
    level: string;
    slidesCount: number;
    legalText: string;
    legalLinkText: string;
}

export interface StreakPromotionAttributes {
    hidden: GiveEligible;
    type: string;
    title: string;
    image: string;
    activity_progress: string;
    last_updated: Date;
    break_image: string;
    lifetime_max: string;
    bonus_points: string;
    give_eligible: GiveEligible;
    destination: string;
}

export interface SuggestedReward {
    name: string;
    price: number;
    provider: string;
    category: string;
    title: string;
    smallImageUrl: string;
    mediumImageUrl: string;
    largeImageUrl: string;
    largeShowcaseImageUrl: string;
    description: Description;
    showcase: boolean;
    showcaseInAllCategory: boolean;
    originalPrice: number;
    discountedPrice: number;
    popular: boolean;
    isTestOnly: boolean;
    groupId: string;
    inGroup: boolean;
    isDefaultItemInGroup: boolean;
    groupTitle: string;
    groupImageUrl: string;
    groupShowcaseImageUrl: string;
    instantWinGameId: string;
    instantWinPlayAgainSku: string;
    isLowInStock: boolean;
    isOutOfStock: boolean;
    getCodeMessage: string;
    disableEmail: boolean;
    stockMessage: string;
    comingSoonFlag: boolean;
    isGenericDonation: boolean;
    isAutoRedeem: boolean;
}

export interface Description {
    itemGroupText: string;
    smallText: string;
    largeText: string;
    legalText: string;
    showcaseTitle: string;
    showcaseDescription: string;
}

export interface UserStatus {
    levelInfo: LevelInfo;
    availablePoints: number;
    lifetimePoints: number;
    lifetimePointsRedeemed: number;
    ePuid: string;
    redeemGoal: SuggestedReward;
    counters: Counters;
    lastOrder: LastOrder;
    dashboardImpression: DashboardImpression;
    referrerProgressInfo: ReferrerProgressInfo;
    isGiveModeOn: boolean;
    giveBalance: number;
    lifetimeGivingPoints: number;
    isRewardsUser: boolean;
    isMuidTrialUser: boolean;
}

export interface Counters {
    pcSearch: DashboardImpression[];
    mobileSearch: DashboardImpression[];
    shopAndEarn: DashboardImpression[];
    activityAndQuiz: ActivityAndQuiz[];
    dailyPoint: DashboardImpression[];
}

export interface ActivityAndQuiz {
    name: string;
    priority: number;
    attributes: ActivityAndQuizAttributes;
    offerId: string;
    complete: boolean;
    counter: number;
    activityProgress: number;
    activityProgressMax: number;
    pointProgressMax: number;
    pointProgress: number;
    promotionType: string;
    promotionSubtype: string;
    title: string;
    extBannerTitle: string;
    titleStyle: string;
    theme: string;
    description: string;
    extBannerDescription: string;
    descriptionStyle: string;
    showcaseTitle: string;
    showcaseDescription: string;
    imageUrl: string;
    dynamicImage: string;
    smallImageUrl: string;
    backgroundImageUrl: string;
    showcaseBackgroundImageUrl: string;
    showcaseBackgroundLargeImageUrl: string;
    promotionBackgroundLeft: string;
    promotionBackgroundRight: string;
    iconUrl: string;
    animatedIconUrl: string;
    animatedLargeBackgroundImageUrl: string;
    destinationUrl: string;
    linkText: string;
    hash: string;
    activityType: string;
    isRecurring: boolean;
    isHidden: boolean;
    isTestOnly: boolean;
    isGiveEligible: boolean;
    level: string;
    slidesCount: number;
    legalText: string;
    legalLinkText: string;
}

export interface ActivityAndQuizAttributes {
    type: string;
    title: string;
    link_text: string;
    description: string;
    foreground_color: string;
    image: string;
    recurring: string;
    destination: string;
    'classification.ShowProgress': GiveEligible;
    hidden: GiveEligible;
    give_eligible: GiveEligible;
}

export interface LastOrder {
    id: string;
    price: number;
    status: string;
    sku: string;
    timestamp: Date;
    catalogItem: SuggestedReward;
}

export interface LevelInfo {
    activeLevel: string;
    activeLevelName: string;
    progress: number;
    progressMax: number;
    levels: Level[];
    benefitsPromotion: DashboardImpression;
}

export interface Level {
    key: string;
    active: boolean;
    name: string;
    tasks: CloseLink[];
    privileges: CloseLink[];
}

export interface ReferrerProgressInfo {
    pointsEarned: number;
    pointsMax: number;
    isComplete: boolean;
    promotions: any[];
}